import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import OrderDetails from '../../components/account/OrderDetails';
import { getOrderStatus } from '../../api/orderStatus';
import { usePageTitle } from '../../hooks/usePageTitle';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const user = useAuthStore((s) => s.user);
  const order = useOrderStore((s) =>
    s.orders.find((o) => o.id === orderId)
  );

  usePageTitle(order?.id ?? 'Order');

  if (!order || !user || order.userId !== user.id) {
    return (
      <div>
        <Link
          to="/account/orders"
          className="text-xs text-gray-500 hover:text-black underline"
        >
          ← Back to orders
        </Link>
        <div className="text-center py-16">
          <h1 className="text-xl font-semibold">Order not found</h1>
          <p className="text-sm text-gray-500 mt-2">
            We couldn't find an order with ID {orderId}.
          </p>
        </div>
      </div>
    );
  }

  const status = getOrderStatus(order.status);

  return (
    <div>
      <Link
        to="/account/orders"
        className="text-xs text-gray-500 hover:text-black underline"
      >
        ← Back to orders
      </Link>

      <div className="mt-4 mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-mono">
            {order.id}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`text-xs font-medium shrink-0 ${status.className}`}>
          {status.label}
        </span>
      </div>

      <OrderDetails order={order} />
    </div>
  );
}