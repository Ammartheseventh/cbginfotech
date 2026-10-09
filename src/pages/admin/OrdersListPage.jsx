import { Link } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { getOrderStatus } from '../../api/orderStatus';
import { usePageTitle } from '../../hooks/usePageTitle';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OrdersListPage() {
  usePageTitle('Admin · Orders');

  const orders = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.loading);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          All Orders
        </h1>
        <div className="border border-gray-200 rounded-md p-12 text-center">
          <p className="text-sm text-gray-500">No orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">
        All Orders
      </h1>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => {
          const itemCount = order.items.reduce(
            (sum, i) => sum + i.quantity,
            0
          );
          const status = getOrderStatus(order.status);

          return (
            <li key={order.id}>
              <Link
                to={`/admin/orders/${order.id}`}
                className="block border border-gray-200 rounded-md transition-all duration-200 hover:border-gray-300 hover:translate-x-1"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-mono text-gray-900">
                      {order.id}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      RM{order.total}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4 mt-1">
                    <p className="text-xs text-gray-500">
                      {order.customer.name} · {itemCount}{' '}
                      {itemCount === 1 ? 'item' : 'items'} ·{' '}
                      {order.delivery === 'ship' ? 'Ship' : 'Pickup'}
                    </p>
                    <p className="text-xs text-gray-500 shrink-0">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}