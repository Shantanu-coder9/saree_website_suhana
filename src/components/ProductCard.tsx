import { Link } from 'react-router-dom';
import { Star, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <img
          src={product.images[1]}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {discount}% OFF
          </span>
        )}
        {product.newArrival && !discount && (
          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            NEW
          </span>
        )}
        {product.bestseller && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            BESTSELLER
          </span>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-stone-600">{product.rating}</span>
          <span className="text-xs text-stone-400">({product.reviews})</span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-stone-800 text-sm leading-snug hover:text-rose-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-stone-500 mt-1">{product.fabric} · {product.occasion}</p>
        <div className="flex items-center gap-2 mt-2.5">
          <span className="text-lg font-semibold text-stone-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-stone-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-rose-900 text-stone-700 hover:text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-300"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
