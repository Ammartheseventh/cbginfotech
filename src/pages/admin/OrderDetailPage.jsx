import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useToastStore } from '../../store/useToastStore';
import { getReceiptSignedUrl } from '../../api/storage';
import { getOrderStatus, ORDER_STATUS } from '../../api/orderStatus';
import { usePageTitle } from '../../hooks/usePageTitle';

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Forward transitions depend on the order's delivery method:
// pickup orders go verifying -> ready_for_pickup, ship orders go
// verifying -> shipping. The two are mutually exclusive.
function forwardTransitions(order) {
  const isShip = order.delivery === 'ship';
  switch (order.status) {
    case 'awaiting_payment_receipt':
      return ['verifying'];
    case 'verifying':
      return isShip ? ['shipping'] : ['ready_for_pickup'];
    case 'shipping':
      return ['received'];
    case 'ready_for_pickup':
      return ['received'];
    default:
      return [];
  }
}

// Revert transitions mirror the forward ones, allowing the admin to
// undo a mistake. received goes back to the appropriate delivery state,
// not straight to verifying.
function backTransitions(order) {
  const isShip = order.delivery === 'ship';
  switch (order.status) {
    case 'verifying':
      return ['awaiting_payment_receipt'];
    case 'shipping':
    case 'ready_for_pickup':
      return ['verifying'];
    case 'received':
      return isShip ? ['shipping'] : ['ready_for_pickup'];
    default:
      return [];
  }
}

const ACTION_LABELS = {
  awaiting_payment_receipt: 'Request new receipt',
  verifying: 'Mark receipt as valid',
  shipping: 'Mark as shipped',
  ready_for_pickup: 'Mark as ready for pickup',
  received: 'Mark as received',
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const fetchOrderById = useOrderStore((s) => s.fetchOrderById);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const showToast = useToastStore((s) => s.show);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  usePageTitle(order ? `Admin · ${order.id}` : 'Admin · Order');

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchOrderById(orderId).then((result) => {
      if (!cancelled) {
        setOrder(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [orderId, fetchOrderById]);

  const handleViewReceipt = async () => {
    try {
      const url = await getReceiptSignedUrl(order.receipt.path, 60);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      showToast(err.message ?? 'Could not open receipt');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (updating || newStatus === order.status) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      showToast('Status updated');
    } catch (err) {
      showToast(err.message ?? 'Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  if (!order) {
    return (
      <div>
        <Link
          to="/admin/orders"
          className="text-xs text-gray-500 hover:text-brand underline transition-colors"
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
  const forward = forwardTransitions(order);
  const back = backTransitions(order);

  return (
    <div>
      <Link
        to="/admin/orders"
        className="text-xs text-gray-500 hover:text-brand underline transition-colors"
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

      {/* Status controls */}
      {(forward.length > 0 || back.length > 0) && (
        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
            Update status
          </h2>

          {forward.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {forward.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusChange(s)}
                  disabled={updating}
                  className="px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {ACTION_LABELS[s] ?? s}
                </button>
              ))}
            </div>
          )}

          {back.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Made a mistake?</p>
              <div className="flex flex-wrap gap-4">
                {back.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    disabled={updating}
                    className="text-xs text-gray-500 hover:text-brand underline transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Revert to {ORDER_STATUS[s]?.label ?? s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Customer */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Customer
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm">
          <p className="text-gray-900">{order.customer.name}</p>
          <p className="text-gray-500">{order.customer.email}</p>
          <p className="text-gray-500">{order.customer.phone}</p>
        </div>
      </section>

      {/* Delivery */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          {order.delivery === 'ship' ? 'Shipping address' : 'Pickup'}
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-500">
          {order.delivery === 'ship' && order.address ? (
            <>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.postal}
              </p>
              <p>{order.address.state}</p>
            </>
          ) : (
            <p className="text-gray-900">Pick up in person</p>
          )}
        </div>
      </section>

      {/* Receipt */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Payment receipt
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm">
          {order.receipt ? (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-gray-900 break-all">
                  {order.receipt.fileName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded {formatDate(order.receipt.uploadedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleViewReceipt}
                className="text-xs text-gray-500 hover:text-brand underline whitespace-nowrap shrink-0 transition-colors"
              >
                View receipt
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No receipt uploaded yet.</p>
          )}
        </div>
      </section>

      {/* Items */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Items
        </h2>
        <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
          {order.items.map((item) => (
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

        <div className="border border-t-0 border-gray-200 rounded-b-md p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">RM{order.subtotal}</span>
          </div>
          {order.coupon && (
            <div className="flex justify-between mt-2">
              <span className="text-gray-500">
                Discount{' '}
                <span className="font-mono text-gray-400">
                  {order.coupon.code}
                </span>
              </span>
              <span className="text-gray-900">-RM{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between mt-2">
            <span className="text-gray-500">
              {order.delivery === 'ship' ? 'Shipping' : 'Pickup'}
            </span>
            <span className="text-gray-900">
              {order.delivery === 'ship' ? `RM${order.shipping}` : 'Free'}
            </span>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">RM{order.total}</span>
          </div>
        </div>
      </section>

      {/* Payment method */}
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Payment method
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-900 capitalize">
          {order.paymentMethod.replace('_', ' ')}
        </div>
      </section>
    </div>
  );
}