import { useOrderStore } from '../../store/useOrderStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import OrdersList from './OrdersList';

export default function CompletedOrdersPage() {
  usePageTitle('Admin · Completed Orders');

  const allOrders = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.loading);

  const completedOrders = allOrders.filter((o) => o.status === 'received');

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <OrdersList
      orders={completedOrders}
      title="Completed Orders"
      switchTo="/admin/orders"
      switchLabel="← Back to active orders"
    />
  );
}