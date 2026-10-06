import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '../../store/useCheckoutStore';
import { useCartStore } from '../../store/useCartStore';
import { calculateShipping } from '../../api/shipping';
import { useAsync } from '../../hooks/useAsync';
import { usePageTitle } from '../../hooks/usePageTitle';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';

export default function DeliveryPage() {
  usePageTitle('Checkout');

  const navigate = useNavigate();
  const info = useCheckoutStore((s) => s.info);
  const storedDelivery = useCheckoutStore((s) => s.delivery);
  const setDelivery = useCheckoutStore((s) => s.setDelivery);
  const setShipping = useCheckoutStore((s) => s.setShipping);
  const items = useCartStore((s) => s.items);

  const [delivery, setLocalDelivery] = useState(storedDelivery ?? '');

  useEffect(() => {
    if (!info) navigate('/checkout', { replace: true });
  }, [info, navigate]);

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true });
  }, [items, navigate]);

  // Derive shipping via useAsync. Only fetched when delivery === 'ship'.
  const fetchShipping = useCallback(() => {
    if (delivery !== 'ship') return Promise.resolve(null);
    return calculateShipping({
      items,
      state: info?.address?.state ?? '',
    });
  }, [delivery, items, info]);

  const { data: shipping, loading: loadingShipping } = useAsync(fetchShipping);

  const handleContinue = () => {
    if (!delivery) return;
    setDelivery(delivery);
    setShipping(delivery === 'ship' ? shipping : null);
    navigate('/checkout/review');
  };

  if (!info) return null;

  return (
    <div>
      <CheckoutSteps current="delivery" />

      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        Delivery Method
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        How would you like to receive your order?
      </p>

      <div className="flex flex-col gap-3 mb-8">
        <Option
          value="ship"
          selected={delivery === 'ship'}
          onSelect={setLocalDelivery}
          title="Ship to my address"
          subtitle={
            delivery === 'ship' && loadingShipping
              ? 'Calculating shipping…'
              : delivery === 'ship' && shipping
              ? `${shipping.weight} kg · Shipping to ${shipping.state}`
              : 'Standard delivery to the address you provided'
          }
          right={
            delivery === 'ship' && shipping
              ? `RM${shipping.price}`
              : null
          }
        />

        <Option
          value="pickup"
          selected={delivery === 'pickup'}
          onSelect={setLocalDelivery}
          title="Pick up in person"
          subtitle="We'll call you to arrange a pickup time and location"
          right="Free"
        />
      </div>

      {delivery === 'ship' && shipping && (
        <div className="mb-8 p-4 border border-gray-200 rounded-md text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total weight</span>
            <span className="text-gray-900">{shipping.weight} kg</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">
              Shipping to {shipping.state}
            </span>
            <span className="text-gray-900">RM{shipping.price}</span>
          </div>
        </div>
      )}

      {delivery === 'pickup' && (
        <div className="mb-8 p-4 border border-gray-200 rounded-md text-sm text-gray-600">
          After placing your order, we'll contact you using the phone number
          you provided to arrange a pickup time.
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="text-sm text-gray-500 hover:text-black underline"
        >
          Back to Information
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!delivery || loadingShipping}
          className="px-6 py-3 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Review
        </button>
      </div>
    </div>
  );
}

function Option({ value, selected, onSelect, title, subtitle, right }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`w-full text-left p-4 border rounded-md transition-colors ${
        selected
          ? 'border-black bg-gray-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              selected ? 'border-black' : 'border-gray-300'
            }`}
          >
            {selected && <span className="w-2 h-2 rounded-full bg-black" />}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {right && (
          <span className="text-sm font-semibold whitespace-nowrap">
            {right}
          </span>
        )}
      </div>
    </button>
  );
}