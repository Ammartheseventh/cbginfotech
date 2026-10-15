import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing auth header' }, 401);
    }

    // Client scoped to the caller's JWT so RLS applies.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { orderId } = await req.json();
    if (!orderId) {
      return json({ error: 'Missing orderId' }, 400);
    }

    // RLS ensures the caller can only fetch their own order.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return json({ error: 'Order not found' }, 404);
    }

    if (!order.receipt_path) {
      return json({ error: 'Order has no receipt' }, 400);
    }

    // Short-lived signed URL for the attachment.
    const { data: signed, error: signedError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(order.receipt_path, 300);

    if (signedError || !signed) {
      return json({ error: 'Could not sign receipt URL' }, 500);
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const notifyEmail = Deno.env.get('NOTIFY_EMAIL');
    const adminUrl = Deno.env.get('ADMIN_URL');

    const itemLines = order.items
      .map(
        (i: { quantity: number; name: string; price: number }) =>
          `  ${i.quantity}× ${i.name} — RM${i.price * i.quantity}`
      )
      .join('\n');

    const textBody = `A new payment receipt has been uploaded.

Order ID: ${order.id}
Customer: ${order.customer.name}
Email:    ${order.customer.email}
Phone:    ${order.customer.phone}

Delivery: ${order.delivery === 'ship' ? 'Ship to address' : 'Pick up in person'}
${
  order.delivery === 'ship' && order.address
    ? `${order.address.street}\n${order.address.city}, ${order.address.postal}\n${order.address.state}`
    : ''
}

Items:
${itemLines}

Total: RM${order.total}

View and process this order:
${adminUrl}/admin/orders/${order.id}
`;

    const { error: sendError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: notifyEmail!,
      subject: `New payment receipt — ${order.id}`,
      text: textBody,
      attachments: [
        {
          filename: order.receipt_file_name ?? 'receipt',
          path: signed.signedUrl,
        },
      ],
    });

    if (sendError) {
      return json({ error: sendError.message }, 500);
    }

    return json({ success: true }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}