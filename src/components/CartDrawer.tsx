import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setCartOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-stone-50 z-[70] shadow-2xl transition-transform duration-500 flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <h2 className="text-lg font-serif font-semibold text-stone-900">
            Shopping Bag {totalItems > 0 && `(${totalItems})`}
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-stone-400" />
            </div>
            <p className="text-stone-500 text-center">Your shopping bag is empty</p>
            <Link
              to="/shop"
              onClick={() => setCartOpen(false)}
              className="bg-rose-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-rose-800 transition-colors"
            >
              Browse Sarees
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 bg-white rounded-xl p-3">
                  <Link to={`/product/${item.product.id}`} onClick={() => setCartOpen(false)} className="shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-24 object-cover rounded-lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-stone-800 truncate">{item.product.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">{item.product.fabric}</p>
                    <p className="text-sm font-semibold text-stone-900 mt-1">₹{item.product.price.toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-auto text-xs text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 p-5 space-y-4">
              <div className="flex justify-between text-base">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-semibold text-stone-900">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center bg-rose-900 text-white py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors"
              >
                Proceed to Checkout
              </Link>
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="block w-full text-center text-stone-600 text-sm hover:text-rose-700 transition-colors"
              >
                View Full Bag
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
