export const ORDER_STATUS = {
  awaiting_payment_receipt: {
    label: 'Awaiting payment receipt',
    className: 'text-amber-700',
  },
  verifying: {
    label: 'Verifying receipt',
    className: 'text-amber-700',
  },
  shipping: {
    label: 'Being shipped',
    className: 'text-blue-700',
  },
  ready_for_pickup: {
    label: 'Ready for pickup',
    className: 'text-green-700',
  },
  received: {
    label: 'Received',
    className: 'text-green-700',
  },
};

export function getOrderStatus(status) {
  return ORDER_STATUS[status] ?? ORDER_STATUS.awaiting_payment_receipt;
}