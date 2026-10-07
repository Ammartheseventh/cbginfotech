const steps = [
  { key: 'information', label: 'Information', path: '/checkout' },
  { key: 'delivery', label: 'Delivery', path: '/checkout/delivery' },
  { key: 'review', label: 'Review', path: '/checkout/review' },
  { key: 'payment', label: 'Payment', path: null },
];

export default function CheckoutSteps({ current }) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-2 text-xs mb-8">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={
                isCurrent
                  ? 'font-semibold text-brand'
                  : isComplete
                  ? 'text-gray-900'
                  : 'text-gray-400'
              }
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-gray-300">/</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}