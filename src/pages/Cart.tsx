import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-stone-400" />
          </div>
          <h1 className="text-2xl font-serif text-stone-900 mb-3">Your Bag is Empty</h1>
          <p className="text-stone-500 mb-6">Discover sarees that speak to your style.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-rose-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors">
            Browse Sarees <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice > 5000 ? 0 : 150;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Bag ({totalItems})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-2xl p-4 flex gap-4">
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-28 h-36 object-cover rounded-xl" />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-medium text-stone-800 hover:text-rose-700 transition-colors">{item.product.name}</h3>
                      </Link>
                      <p className="text-sm text-stone-500 mt-1">{item.product.fabric} · {item.product.color}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-stone-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-stone-100 rounded-full px-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-semibold text-stone-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-serif font-semibold text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="font-medium text-stone-900">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Shipping</span>
                <span className="font-medium text-stone-900">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">Tax (5%)</span>
                <span className="font-medium text-stone-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-rose-600">Add ₹{(5000 - totalPrice).toLocaleString('en-IN')} more for free shipping</p>
              )}
            </div>
            <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between">
              <span className="font-semibold text-stone-900">Total</span>
              <span className="font-bold text-xl text-stone-900">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <Link to="/checkout" className="block w-full text-center bg-rose-900 text-white py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors mt-6">
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="block w-full text-center text-stone-600 text-sm hover:text-rose-700 transition-colors mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
