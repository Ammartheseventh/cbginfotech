import { useOrderStore } from '../../store/useOrderStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import OrdersList from './OrdersList';

export default function OrdersListPage() {
  usePageTitle('Admin · Orders');

  const allOrders = useOrderStore((s) => s.orders);
  const loading = useOrderStore((s) => s.loading);

  const activeOrders = allOrders.filter((o) => o.status !== 'received');

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <OrdersList
      orders={activeOrders}
      title="Active Orders"
      switchTo="/admin/orders/completed"
      switchLabel="Go to completed orders →"
    />
  );
}