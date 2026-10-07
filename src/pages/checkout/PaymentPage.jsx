import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import CheckoutSteps from '../../components/checkout/CheckoutSteps';
import OrderDetails from '../../components/account/OrderDetails';

export default function PaymentPage() {
  const { orderId } = useParams();
  const order = useOrderStore((s) =>
    s.orders.find((o) => o.id === orderId)
  );

  usePageTitle(order ? 'Payment' : 'Order');

  if (!order) {
    return (
      <div>
        <CheckoutSteps current="payment" />
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold">Order not found</h1>
          <p className="text-sm text-gray-500 mt-2">
            We couldn't find an order with ID {orderId}.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 px-6 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CheckoutSteps current="payment" />

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Complete your payment
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Order <span className="font-mono text-gray-900">{order.id}</span>
        </p>
      </div>

      <OrderDetails order={order} />
    </div>
  );
}