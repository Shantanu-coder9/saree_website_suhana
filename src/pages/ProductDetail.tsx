import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, Truck, RefreshCw, ShieldCheck, Camera, Plus, Minus } from 'lucide-react';
import { getProductById, products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const product = id ? getProductById(id) : undefined;
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 text-lg mb-4">Saree not found.</p>
          <Link to="/shop" className="text-rose-700 font-medium hover:text-rose-900">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-600 hover:text-rose-700 transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === idx ? 'border-rose-700' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-stone-700">{product.rating}</span>
              </div>
              <span className="text-sm text-stone-400">·</span>
              <span className="text-sm text-stone-500">{product.reviews} reviews</span>
              {product.bestseller && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">BESTSELLER</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-serif text-stone-900 mb-2">{product.name}</h1>
            <p className="text-stone-500 text-sm mb-4">{product.fabric} · {product.occasion} Wear</p>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-semibold text-stone-900">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-lg text-stone-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {discount > 0 && (
                <span className="text-rose-600 font-medium text-sm">Save {discount}%</span>
              )}
            </div>

            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-xl">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Fabric</p>
                <p className="text-sm font-medium text-stone-800">{product.fabric}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Color</p>
                <p className="text-sm font-medium text-stone-800">{product.color}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Occasion</p>
                <p className="text-sm font-medium text-stone-800">{product.occasion}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Category</p>
                <p className="text-sm font-medium text-stone-800">{product.category}</p>
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-full border border-stone-200 px-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-900 text-white py-3.5 rounded-full font-medium hover:bg-rose-800 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            </div>

            <Link
              to="/try-on"
              className="flex items-center justify-center gap-2 w-full bg-amber-100 text-amber-800 py-3.5 rounded-full font-medium hover:bg-amber-200 transition-colors mb-6"
            >
              <Camera className="w-5 h-5" />
              Try This Saree Virtually
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
              <div className="text-center">
                <Truck className="w-6 h-6 text-rose-700 mx-auto mb-2" />
                <p className="text-xs text-stone-600">Free Shipping</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-rose-700 mx-auto mb-2" />
                <p className="text-xs text-stone-600">7-Day Returns</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="w-6 h-6 text-rose-700 mx-auto mb-2" />
                <p className="text-xs text-stone-600">Authentic Product</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-serif text-stone-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
