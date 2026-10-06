import { useCartStore } from '../../store/useCartStore';

export default function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-md overflow-hidden">
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between gap-4">
            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
            <span className="text-sm font-semibold whitespace-nowrap">
              {item.price * item.quantity}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{item.categoryName}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="px-3 py-1 text-sm hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-3 py-1 text-sm border-x border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-sm hover:bg-gray-100"
            >
              +
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="text-xs text-gray-500 hover:text-brand underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}