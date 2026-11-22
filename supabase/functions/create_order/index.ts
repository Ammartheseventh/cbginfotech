// supabase/functions/create_order/index.ts
//
// Authoritative order creation. The client sends only item IDs, quantities,
// and PII — never prices or totals. This function:
//   1. Verifies the caller's JWT
//   2. Fetches live prices from Sanity
//   3. Validates coupon + shipping server-side
//   4. Computes subtotal/discount/shipping/total with cent-level rounding
//   5. Inserts the order with service_role (bypasses RLS)
//
// Once deployed and the INSERT policy is dropped, this is the only path
// to create an order.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SANITY_PROJECT_ID = Deno.env.get('SANITY_PROJECT_ID')!
const SANITY_DATASET = Deno.env.get('SANITY_DATASET')!
const SANITY_API_TOKEN = Deno.env.get('SANITY_API_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const DEFAULT_BASE_RATE = 20
const MAX_ITEMS = 50
const MAX_QUANTITY_PER_ITEM = 99
const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_MAX_ORDERS = 5
const PRICE_TOLERANCE = 0.01
const VALID_PAYMENT_METHODS = ['duitnow', 'bank_transfer']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------- helpers ----------

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function errorResponse(code: string, message: string, status = 400, extra: object = {}) {
  return jsonResponse({ error: { code, message, ...extra } }, status)
}

async function sanityFetch<T = unknown>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const sp = new URLSearchParams()
  sp.set('query', query)
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.set(`$${k}`, JSON.stringify(v))
  }
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-10-01/data/query/${SANITY_DATASET}?${sp}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SANITY_API_TOKEN}` } })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Sanity fetch failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  return json.result as T
}

function imageUrl(img: any): string | null {
  if (!img) return null
  if (img.url) return img.url
  const ref = img.asset?._ref
  if (!ref) return null
  const parts = ref.split('-')
  if (parts.length < 4) return null
  const [, id, dimensions, format] = parts
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`
}

const round2 = (n: number) => Math.round(n * 100) / 100

// ---------- types ----------

interface ItemInput {
  id: string
  quantity: number
}

interface OrderBody {
  items: ItemInput[]
  expectedSubtotal: number
  couponCode?: string | null
  delivery: 'ship' | 'pickup'
  address?: {
    street: string
    city: string
    state: string
    postal: string
  } | null
  customer: {
    name: string
    email: string
    phone: string
  }
  paymentMethod: string
  idempotencyKey: string
}

// ---------- main handler ----------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })
  if (req.method !== 'POST') return errorResponse('METHOD_NOT_ALLOWED', 'POST only', 405)

  try {
    // 1. Verify JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('UNAUTHORIZED', 'Missing auth token', 401)
    }
    const token = authHeader.slice(7)

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) return errorResponse('UNAUTHORIZED', 'Invalid auth token', 401)

    // 2. Parse + validate body shape
    let body: OrderBody
    try {
      body = await req.json()
    } catch {
      return errorResponse('INVALID_BODY', 'Body must be valid JSON')
    }

    if (!Array.isArray(body.items) || body.items.length === 0)
      return errorResponse('INVALID_BODY', 'items is required and must be non-empty')
    if (body.items.length > MAX_ITEMS)
      return errorResponse('INVALID_BODY', `Maximum ${MAX_ITEMS} items per order`)
    for (const it of body.items) {
      if (!it || typeof it.id !== 'string' || !it.id)
        return errorResponse('INVALID_BODY', 'Each item needs a string id')
      if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > MAX_QUANTITY_PER_ITEM)
        return errorResponse('INVALID_BODY', `Each quantity must be 1-${MAX_QUANTITY_PER_ITEM}`)
    }
    if (body.delivery !== 'ship' && body.delivery !== 'pickup')
      return errorResponse('INVALID_BODY', 'delivery must be "ship" or "pickup"')
    if (body.delivery === 'ship') {
      const a = body.address
      if (!a || !a.street || !a.city || !a.state || !a.postal)
        return errorResponse('INVALID_BODY', 'address (street/city/state/postal) required for shipping')
    }
    if (!body.customer?.name?.trim() || !body.customer?.email?.trim() || !body.customer?.phone?.trim())
      return errorResponse('INVALID_BODY', 'customer name/email/phone required')
    if (!VALID_PAYMENT_METHODS.includes(body.paymentMethod))
      return errorResponse('INVALID_BODY', 'Invalid paymentMethod')
    if (!body.idempotencyKey || typeof body.idempotencyKey !== 'string' || body.idempotencyKey.length < 8)
      return errorResponse('INVALID_BODY', 'idempotencyKey required')
    if (typeof body.expectedSubtotal !== 'number' || body.expectedSubtotal < 0)
      return errorResponse('INVALID_BODY', 'expectedSubtotal required')

    // 3. Rate limit
    const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString()
    const { count: recentCount } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', cutoff)
    if ((recentCount ?? 0) >= RATE_LIMIT_MAX_ORDERS) {
      return errorResponse('RATE_LIMITED', 'Too many orders. Please wait a moment and try again.', 429)
    }

    // 4. Idempotency: short-circuit if this key already created an order
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('idempotency_key', body.idempotencyKey)
      .maybeSingle()
    if (existing) return jsonResponse({ orderId: existing.id, idempotent: true })

    // 5. Fetch live product data
    const productIds = [...new Set(body.items.map((i) => i.id))]
    const products = await sanityFetch<any[]>(
      `*[_type == 'product' && _id in $ids] {
        _id, name, price, weight, inStock, images
      }`,
      { ids: productIds }
    )
    const productMap = new Map(products.map((p) => [p._id, p]))

    for (const it of body.items) {
      const p = productMap.get(it.id)
      if (!p) return errorResponse('PRODUCT_NOT_FOUND', `Product ${it.id} not found`, 404)
      if (!p.inStock) return errorResponse('OUT_OF_STOCK', `${p.name} is out of stock`, 409)
    }

    // 6. Recompute subtotal from live prices
    const orderItems = body.items.map((it) => {
      const p = productMap.get(it.id)!
      return {
        id: it.id,
        name: p.name,
        price: Number(p.price),
        quantity: it.quantity,
        images: (p.images ?? []).map(imageUrl).filter(Boolean),
      }
    })
    const actualSubtotal = round2(
      orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
    )

    // 7. Price-change detection
    if (Math.abs(actualSubtotal - body.expectedSubtotal) > PRICE_TOLERANCE) {
      return errorResponse(
        'PRICE_CHANGED',
        'Prices have changed since you added items to your cart. Please review before continuing.',
        409,
        { newSubtotal: actualSubtotal, oldSubtotal: body.expectedSubtotal }
      )
    }

    // 8. Coupon
    let coupon: { code: string; type: string; value: number } | null = null
    let discount = 0
    if (body.couponCode) {
      const normalized = body.couponCode.trim().toUpperCase()
      if (normalized) {
        const doc = await sanityFetch<any>(
          `*[_type == 'coupon' && code == $code][0] { code, type, value }`,
          { code: normalized }
        )
        if (doc) {
          coupon = { code: doc.code, type: doc.type, value: Number(doc.value) }
          if (doc.type === 'percent') discount = round2((actualSubtotal * doc.value) / 100)
          else if (doc.type === 'fixed') discount = Math.min(Number(doc.value), actualSubtotal)
        }
        // Invalid coupon: silently ignored (matches current client behavior).
        // To reject instead, change to: return errorResponse('INVALID_COUPON', ...)
      }
    }

    // 9. Shipping
    let shippingCost = 0
    if (body.delivery === 'ship') {
      const totalWeight = body.items.reduce((s, it) => {
        const p = productMap.get(it.id)!
        return s + Number(p.weight ?? 0) * it.quantity
      }, 0)

      const rates = await sanityFetch<any[]>(
        `*[_type == 'shippingRate'] { state, brackets }`
      )
      let brackets = rates.find((r) => r.state === body.address!.state)?.brackets ?? []
      if (!brackets.length && rates.length > 0) brackets = rates[0].brackets ?? []

      const normalized = brackets.map((b: any) => ({
        maxKg: b.maxKg === null ? Infinity : Number(b.maxKg),
        price: Number(b.price),
      }))
      const match = normalized.find((b: any) => totalWeight <= b.maxKg)
      shippingCost = match?.price ?? DEFAULT_BASE_RATE
    }

    // 10. Total
    const total = round2(actualSubtotal - discount + shippingCost)

    // 11. Insert with service_role (bypasses RLS)
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        idempotency_key: body.idempotencyKey,
        status: 'awaiting_payment_receipt',
        customer: body.customer,
        address: body.delivery === 'ship' ? body.address : null,
        delivery: body.delivery,
        items: orderItems,
        subtotal: actualSubtotal,
        discount,
        coupon,
        shipping: shippingCost,
        total,
        payment_method: body.paymentMethod,
      })
      .select('id')
      .single()

    if (insertError) {
      // Race on idempotency: another call with the same key won
      if (insertError.code === '23505') {
        const { data: retry } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('idempotency_key', body.idempotencyKey)
          .maybeSingle()
        if (retry) return jsonResponse({ orderId: retry.id, idempotent: true })
      }
      console.error('Insert failed:', insertError)
      return errorResponse('INSERT_FAILED', 'Could not create order', 500)
    }

    return jsonResponse({ orderId: inserted.id })
  } catch (err) {
    console.error('create_order unhandled:', err)
    return errorResponse(
      'INTERNAL_ERROR',
      err instanceof Error ? err.message : 'Unknown error',
      500
    )
  }
})