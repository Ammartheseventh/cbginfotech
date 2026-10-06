import { useCallback } from 'react';
import duitnowQr from '../../assets/duitnow-qr.png';
import { useAsync } from '../../hooks/useAsync';
import { getPaymentDetails } from '../../api/paymentDetails';

export default function PaymentInstructions({ order }) {
  const fetchDetails = useCallback(
    () => getPaymentDetails(order.paymentMethod),
    [order.paymentMethod]
  );
  const { data: details, loading } = useAsync(fetchDetails);

  if (loading) {
    return (
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Payment instructions
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-500">
          Loading…
        </div>
      </section>
    );
  }

  if (!details) {
    return (
      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Payment instructions
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-600">
          <p>
            Please transfer{' '}
            <strong className="text-gray-900">{order.total}</strong> to
            complete your order.
          </p>
          <p className="mt-2">
            Once paid, upload your receipt below. Your order will be processed
            once the payment is verified.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
        Payment instructions
      </h2>

      <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-600">
        <p>
          Transfer <strong className="text-gray-900">RM{order.total}</strong>{' '}
          using <strong className="text-gray-900">{details.label}</strong>.
        </p>

        {details.type === 'qr' && (
          <div className="mt-4 flex flex-col items-center">
            <div className="bg-white border border-gray-200 rounded-md p-3">
              <img
                src={duitnowQr}
                alt="DuitNow QR code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center max-w-xs">
              {details.instructions}
            </p>
          </div>
        )}

        {details.type === 'bank' && (
          <div className="mt-4 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-gray-400 mt-1">
              Bank details
            </p>
            <div className="flex justify-between">
              <span className="text-gray-500">Bank</span>
              <span className="text-gray-900">{details.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account name</span>
              <span className="text-gray-900">{details.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account number</span>
              <span className="text-gray-900 font-mono">
                {details.accountNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reference</span>
              <span className="text-gray-900 font-mono">{order.id}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {details.instructions}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}