import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { calculateDiscount } from '../api/coupons';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuthStore } from '../store/useAuthStore';
import CartItem from '../components/cart/CartItem';
import CouponInput from '../components/cart/CouponInput';

export default function CartPage() {
  usePageTitle('Cart');
  
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useAuthStore((s) => s.user);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-sm text-gray-500 mt-2">
          Add some products to get started.
        </p>
        <Link
          to="/products"
          className="inline-block mt-6 px-6 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const subtotal = getTotal();
  const discount = calculateDiscount(coupon, subtotal);
  const total = subtotal - discount;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-xs text-gray-500 hover:text-brand underline"
        >
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 mt-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-6 sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Summary
            </h2>

            <div className="mt-4 flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">RM{subtotal}</span>
            </div>

            <div className="mt-4">
              <CouponInput />
            </div>

            {coupon && (
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-gray-600">
                  Discount{' '}
                  <span className="font-mono text-gray-400">
                    {coupon.code}
                  </span>
                </span>
                <span className="font-medium text-gray-900">
                  -RM{discount}
                </span>
              </div>
            )}

            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-500">
                Calculated at checkout
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">RM{total}</span>
            </div>

            {user ? (
              <button
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full py-3 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark transition-colors"
              >
                Proceed to Checkout
              </button>
            ) : (
              <button
                onClick={() =>
                  navigate('/login', { state: { from: '/checkout' } })
                }
                className="mt-6 w-full py-3 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark transition-colors"
              >
                Log in to checkout
              </button>
            )}

            <Link
              to="/products"
              className="block mt-3 text-center text-xs text-gray-500 hover:text-black underline"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}