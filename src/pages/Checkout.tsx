import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Lock, MapPin, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<'shipping' | 'payment' | 'done'>('shipping');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });

  const shipping = totalPrice > 5000 ? 0 : 150;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('done');
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3000);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-900 mb-3">Nothing to checkout</h1>
          <Link to="/shop" className="text-rose-700 font-medium hover:text-rose-900">Browse Sarees</Link>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-serif text-stone-900 mb-3">Order Confirmed!</h1>
          <p className="text-stone-600 mb-6">Thank you for your purchase. Your sarees are on their way. A confirmation email has been sent.</p>
          <div className="bg-white rounded-2xl p-6 text-left mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-rose-700" />
              <span className="font-medium text-stone-800">Order #SU{Math.floor(Math.random() * 100000)}</span>
            </div>
            <p className="text-sm text-stone-500">Estimated delivery: 5-7 business days</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-rose-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'shipping' ? 'bg-rose-900 text-white' : 'bg-emerald-500 text-white'}`}>
              {step === 'payment' ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium text-stone-700">Shipping</span>
          </div>
          <div className="flex-1 h-px bg-stone-300" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'payment' ? 'bg-rose-900 text-white' : 'bg-stone-200 text-stone-500'}`}>
              2
            </div>
            <span className={`text-sm font-medium ${step === 'payment' ? 'text-stone-700' : 'text-stone-400'}`}>Payment</span>
          </div>
          <div className="flex-1 h-px bg-stone-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center text-sm font-medium">3</div>
            <span className="text-sm font-medium text-stone-400">Done</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-5">
              {step === 'shipping' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-rose-700" />
                    <h2 className="text-lg font-serif font-semibold text-stone-900">Shipping Address</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">Full Name</label>
                      <input required value={form.name} onChange={(e) => updateForm('name', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">Phone</label>
                      <input required type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 mb-1 block">Email</label>
                    <input required type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 mb-1 block">Address</label>
                    <input required value={form.address} onChange={(e) => updateForm('address', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">City</label>
                      <input required value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">State</label>
                      <input required value={form.state} onChange={(e) => updateForm('state', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">Pincode</label>
                      <input required value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-rose-900 text-white py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors">
                    Continue to Payment
                  </button>
                </>
              )}

              {step === 'payment' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-rose-700" />
                    <h2 className="text-lg font-serif font-semibold text-stone-900">Payment Details</h2>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 mb-1 block">Card Number</label>
                    <input required placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={(e) => updateForm('cardNumber', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 mb-1 block">Name on Card</label>
                    <input required value={form.cardName} onChange={(e) => updateForm('cardName', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">Expiry</label>
                      <input required placeholder="MM/YY" value={form.expiry} onChange={(e) => updateForm('expiry', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                    <div>
                      <label className="text-sm text-stone-600 mb-1 block">CVV</label>
                      <input required type="password" placeholder="123" value={form.cvv} onChange={(e) => updateForm('cvv', e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Lock className="w-3.5 h-3.5" />
                    Your payment is encrypted and secure
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep('shipping')} className="flex-1 bg-stone-100 text-stone-700 py-3.5 rounded-full font-medium hover:bg-stone-200 transition-colors">
                      Back
                    </button>
                    <button type="submit" className="flex-1 bg-rose-900 text-white py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors">
                      Place Order · ₹{grandTotal.toLocaleString('en-IN')}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          <div className="bg-white rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-serif font-semibold text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.product.name}</p>
                    <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-stone-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-stone-200 pt-4">
              <div className="flex justify-between"><span className="text-stone-600">Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-stone-600">Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between"><span className="text-stone-600">Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-stone-200"><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
