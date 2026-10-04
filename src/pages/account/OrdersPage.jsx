import { Link } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getOrderStatus } from '../../api/orderStatus';
import { usePageTitle } from '../../hooks/usePageTitle';
import OrderCardStack from '../../components/account/OrderCardStack';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OrdersPage() {
  usePageTitle('My Orders');
  
  const user = useAuthStore((s) => s.user);
  const orders = useOrderStore((s) => s.orders);
  const userOrders = user
    ? orders
      .filter((o) => o.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  if (userOrders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          My Orders
        </h1>
        <div className="border border-gray-200 rounded-md p-12 text-center">
          <p className="text-sm text-gray-500">
            You haven't placed any orders yet.
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-8">My Orders</h1>

      <ul className="flex flex-col gap-3">
        {userOrders.map((order) => {
          const itemCount = order.items.reduce(
            (sum, i) => sum + i.quantity,
            0
          );
          const status = getOrderStatus(order.status);

          return (
            <li key={order.id}>
              <Link
                to={`/account/orders/${order.id}`}
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
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
                      {order.delivery === 'ship'
                        ? `Ship to ${order.address?.city ?? 'address'}`
                        : 'Pick up in person'}
                    </p>
                    <p className="text-xs text-gray-500 shrink-0">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4 mt-4">
                    <OrderCardStack items={order.items} />
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