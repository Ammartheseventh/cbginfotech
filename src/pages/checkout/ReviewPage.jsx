import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import CouponInput from '../../components/cart/CouponInput';
import { calculateDiscount } from '../../api/coupons';

const paymentMethods = [
  { value: 'duitnow', label: 'DuitNow QR' },
  { value: 'bank_transfer', label: 'Bank transfer' },
];

export default function ReviewPage() {
  usePageTitle('Checkout');

  const navigate = useNavigate();
  const info = useCheckoutStore((s) => s.info);
  const delivery = useCheckoutStore((s) => s.delivery);
  const shipping = useCheckoutStore((s) => s.shipping);
  const resetCheckout = useCheckoutStore((s) => s.reset);
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrderStore((s) => s.addOrder);
  const user = useAuthStore((s) => s.user);
  const coupon = useCartStore((s) => s.coupon);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (submitting) return;
    if (!info) navigate('/checkout', { replace: true });
    else if (!delivery) navigate('/checkout/delivery', { replace: true });
  }, [info, delivery, navigate, submitting]);

  useEffect(() => {
    if (submitting) return;
    if (items.length === 0) navigate('/cart', { replace: true });
  }, [items, navigate, submitting]);

  if (!info || !delivery) return null;

  const subtotal = getTotal();
  const discount = calculateDiscount(coupon, subtotal);
  const shippingCost = delivery === 'ship' ? shipping?.price ?? 0 : 0;
  const total = subtotal - discount + shippingCost;

  const canSubmit = paymentMethod && agreed && !submitting;

  const handlePlaceOrder = () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const orderId = addOrder({
      userId: user.id,
      status: 'pending_payment',
      customer: {
        name: info.name,
        email: info.email,
        phone: info.phone,
      },
      address: delivery === 'ship' ? info.address : null,
      delivery,
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        images: i.images,
      })),
      subtotal,
      discount,
      coupon,
      shipping: shippingCost,
      total,
      paymentMethod,
      receipt: null,
    });

    clearCart();
    resetCheckout();
    navigate(`/checkout/confirmation/${orderId}`);
  };

  return (
    <div>
      <CheckoutSteps current="review" />

      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        Review & Payment
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Confirm your details, choose a payment method, and place your order.
      </p>

      {/* Cart */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Your order
        </h2>
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  RM{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wide text-gray-500">
            Contact
          </h2>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="text-xs text-gray-500 hover:text-black underline"
          >
            Edit
          </button>
        </div>
        <div className="border border-gray-200 rounded-md p-4 text-sm">
          <p className="text-gray-900">{info.name}</p>
          <p className="text-gray-500">{info.email}</p>
          <p className="text-gray-500">{info.phone}</p>
        </div>
      </section>

      {/* Shipping address — only if shipping */}
      {delivery === 'ship' && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wide text-gray-500">
              Shipping address
            </h2>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="text-xs text-gray-500 hover:text-black underline"
            >
              Edit
            </button>
          </div>
          <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-500">
            <p>{info.address.street}</p>
            <p>
              {info.address.city}, {info.address.postal}
            </p>
            <p>{info.address.state}</p>
          </div>
        </section>
      )}

      {/* Delivery method */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wide text-gray-500">
            Delivery method
          </h2>
          <button
            type="button"
            onClick={() => navigate('/checkout/delivery')}
            className="text-xs text-gray-500 hover:text-black underline"
          >
            Edit
          </button>
        </div>
        <div className="border border-gray-200 rounded-md p-4 text-sm">
          {delivery === 'ship' ? (
            <>
              <p className="text-gray-900">Ship to my address</p>
              {shipping && (
                <p className="text-gray-500 mt-1">
                  {shipping.weight} kg · RM{shipping.price}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-900">Pick up in person</p>
              <p className="text-gray-500 mt-1">
                We'll call you to arrange a pickup time.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Payment method */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Payment method
        </h2>
        <div className="flex flex-col gap-3">
          {paymentMethods.map((pm) => {
            const selected = paymentMethod === pm.value;
            return (
              <button
                key={pm.value}
                type="button"
                onClick={() => setPaymentMethod(pm.value)}
                className={`w-full text-left p-4 border rounded-md transition-colors ${
                  selected
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selected ? 'border-black' : 'border-gray-300'
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-black" />}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{pm.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-4 border border-gray-200 rounded-md text-xs text-gray-600 leading-relaxed">
          After placing your order, you'll be asked to upload a payment receipt
          as proof of payment. Your order will be processed once the receipt is
          verified.
        </div>
      </section>

      {/* Totals */}
      <section className="mb-10">
        <div className="border border-gray-200 rounded-md p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">RM{subtotal}</span>
          </div>

          <div className="mt-3">
            <CouponInput />
          </div>

          {coupon && (
            <div className="flex justify-between mt-3">
              <span className="text-gray-500">
                Discount{' '}
                <span className="font-mono text-gray-400">{coupon.code}</span>
              </span>
              <span className="text-gray-900">-RM{discount}</span>
            </div>
          )}

          <div className="flex justify-between mt-2">
            <span className="text-gray-500">
              {delivery === 'ship' ? 'Shipping' : 'Pickup'}
            </span>
            <span className="text-gray-900">
              {delivery === 'ship'
                ? `RM${shippingCost}`
                : 'Free'}
            </span>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">RM{total}</span>
          </div>
        </div>
      </section>

      {/* Terms */}
      <label className="flex items-start gap-3 mb-8 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-black"
        />
        <span className="text-sm text-gray-600">
          I have read and agree to the{' '}
          <a
            href="/about/terms"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="underline hover:text-brand transition-colors"
          >
            Terms & Conditions
          </a>{' '}
          and the{' '}
          <a
            href="/about/returns"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="underline hover:text-brand transition-colors"
          >
            Return Policy
          </a>
          .
        </span>
      </label>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate('/checkout/delivery')}
          className="text-sm text-gray-500 hover:text-black underline"
        >
          Back to Delivery
        </button>
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={!canSubmit}
          className="px-6 py-3 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Placing order…' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}