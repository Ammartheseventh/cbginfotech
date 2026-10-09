import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/useOrderStore';
import { useToastStore } from '../../store/useToastStore';
import PaymentInstructions from './PaymentInstructions';
import Modal from '../common/Modal';

export default function OrderDetails({ order }) {
  const navigate = useNavigate();
  const uploadReceipt = useOrderStore((s) => s.uploadReceipt);
  const showToast = useToastStore((s) => s.show);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const receipt = order.receipt;
  const hasReceipt = !!receipt;
  const hasPending = !!pendingFile;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
  };

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!pendingFile || submitting) return;
    setSubmitting(true);

    try {
      await uploadReceipt(order, pendingFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
      setShowSuccess(true);
    } catch (err) {
      showToast(err.message ?? 'Could not upload receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadLaterClick = () => {
    setShowLeaveWarning(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveWarning(false);
    navigate('/account/orders');
  };

  const handleUploadNow = () => {
    setShowLeaveWarning(false);
    requestAnimationFrame(() => fileInputRef.current?.click());
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(order.id);
    setCopied(true);
    showToast('Order ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  let helperText;
  let buttonLabel = null;
  let buttonAction = null;
  let buttonStyle = null;

  if (hasReceipt) {
    helperText =
      "Your receipt is being verified. We'll update your order status once it's approved.";
  } else if (hasPending) {
    helperText = "We'll verify the receipt and update your order status.";
    buttonLabel = submitting ? 'Uploading…' : 'Submit Receipt';
    buttonAction = handleSubmit;
    buttonStyle = 'bg-brand text-white hover:bg-brand-dark disabled:opacity-40';
  } else {
    helperText =
      'Your order is placed. You can upload the receipt now, or any time from My Orders.';
    buttonLabel = 'Upload Later';
    buttonAction = handleUploadLaterClick;
    buttonStyle =
      'border border-gray-300 text-gray-700 hover:border-black hover:bg-black hover:text-white';
  }

  return (
    <>
      <PaymentInstructions order={order} />

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Payment receipt
        </h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="sr-only"
        />

        {hasReceipt ? (
          <div className="border border-gray-200 rounded-md p-4">
            <p className="text-sm text-gray-900 break-all">
              {receipt.fileName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Uploaded {new Date(receipt.uploadedAt).toLocaleString()}
            </p>
          </div>
        ) : hasPending ? (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 break-all">
                  {pendingFile.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="text-xs text-gray-500 hover:text-black underline disabled:opacity-40"
                  >
                    Choose a different file
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="text-xs text-gray-500 hover:text-black underline disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="block w-full border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-md p-6 text-center transition-colors"
          >
            <p className="text-sm font-medium text-gray-900">
              Click to upload receipt
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Image or PDF, up to 10MB
            </p>
          </button>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Order summary
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

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          {order.delivery === 'ship' ? 'Shipping to' : 'Pickup'}
        </h2>
        <div className="border border-gray-200 rounded-md p-4 text-sm text-gray-500">
          {order.delivery === 'ship' && order.address ? (
            <>
              <p className="text-gray-900">{order.customer.name}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city}, {order.address.postal}
              </p>
              <p>{order.address.state}</p>
            </>
          ) : (
            <>
              <p className="text-gray-900">Pick up in person</p>
              <p className="mt-1">
                We'll contact you at {order.customer.phone} to arrange a pickup
                time.
              </p>
            </>
          )}
        </div>
      </section>

      <div className="flex flex-col items-center gap-3 mb-4">
        <p className="text-xs text-gray-500 text-center max-w-sm">
          {helperText}
        </p>
        {buttonLabel && (
          <button
            type="button"
            onClick={buttonAction}
            disabled={submitting}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${buttonStyle}`}
          >
            {buttonLabel}
          </button>
        )}
        {hasReceipt && (
          <Link
            to="/account/orders"
            className="text-xs text-gray-500 hover:text-black underline"
          >
            Back to orders
          </Link>
        )}
      </div>

      <Modal isOpen={showLeaveWarning} onClose={() => setShowLeaveWarning(false)}>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Order not yet confirmed
          </h2>
          <p className="text-sm text-gray-500 mt-3">
            We can't process your order until we receive your payment receipt.
            You can upload it now, or later from My Orders.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            <button
              type="button"
              onClick={handleUploadNow}
              className="w-full py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark transition-colors"
            >
              Upload Now
            </button>
            <button
              type="button"
              onClick={handleConfirmLeave}
              className="w-full py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:border-black transition-colors"
            >
              Upload Later
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)}>
        <div className="text-center">
          <div className="text-4xl mb-3">✓</div>
          <h2 className="text-xl font-semibold tracking-tight">
            Order Confirmed
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Thank you, {order.customer.name.split(' ')[0]}. Your order ID is
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-lg font-mono">{order.id}</span>
            <button
              type="button"
              onClick={handleCopyId}
              aria-label={copied ? 'Copied' : 'Copy order ID'}
              className="text-gray-500 hover:text-black transition-colors"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            We're verifying your payment receipt. You'll hear from us once it's
            approved.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowSuccess(false);
              navigate('/account/orders');
            }}
            className="mt-6 px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </Modal>
    </>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}