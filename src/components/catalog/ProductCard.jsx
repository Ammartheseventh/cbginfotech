import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';


export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.show);

  const handleAdd = () => {
    addItem(product);
    showToast(`${product.name} added to cart`);
  };

  return (
    <div className="group flex flex-col">
      <Link
        to={`/products/${product.id}`}
        className="aspect-square overflow-hidden bg-gray-100 rounded-lg block"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/products/${product.id}`}
            className="text-sm font-medium text-gray-900 hover:underline line-clamp-2 min-h-10 flex-1 min-w-0"
          >
            {product.name}
          </Link>
          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            RM{product.price}
          </span>
        </div>
        <p className="text-xs text-brand">{product.categoryName}</p>
      </div>

      <button
        onClick={handleAdd}
        disabled={!product.inStock}
        className="mt-3 w-full py-2 text-sm font-medium rounded-md border border-gray-300 hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-900 disabled:hover:border-gray-300"
      >
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}