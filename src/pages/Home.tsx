import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Scissors, Truck, ShieldCheck, Camera } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

export default function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);

  const collections = [
    { name: 'Silk', tagline: 'Timeless weaves', image: 'https://images.pexels.com/photos/10317106/pexels-photo-10317106.jpeg?auto=compress&cs=tinysrgb&h=600&w=400' },
    { name: 'Chiffon', tagline: 'Light & airy', image: 'https://images.pexels.com/photos/34210956/pexels-photo-34210956.jpeg?auto=compress&cs=tinysrgb&h=600&w=400' },
    { name: 'Designer', tagline: 'Bold statements', image: 'https://images.pexels.com/photos/34155072/pexels-photo-34155072.jpeg?auto=compress&cs=tinysrgb&h=600&w=400' },
    { name: 'Cotton', tagline: 'Everyday comfort', image: 'https://images.pexels.com/photos/33433875/pexels-photo-33433875.jpeg?auto=compress&cs=tinysrgb&h=600&w=400' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/36041239/pexels-photo-36041239.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
            alt="Woman in saree"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/30 to-stone-900/60" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <p className="text-amber-300 text-sm font-medium tracking-[0.3em] uppercase mb-4 animate-fade-in-up">
            Handcrafted · Heritage · Haute Couture
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white leading-tight mb-6 animate-fade-in-up animation-delay-100">
            Drape Yourself in <em className="text-amber-300 not-italic">Elegance</em>
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto animate-fade-in-up animation-delay-200">
            Discover sarees woven by master artisans. From bridal silks to everyday cottons — and try them on virtually before you buy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Link
              to="/shop"
              className="group bg-white text-stone-900 px-8 py-4 rounded-full font-medium hover:bg-amber-300 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/try-on"
              className="group bg-white/10 backdrop-blur-md text-white border border-white/40 px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Virtual Try-On
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* Virtual Try-On Banner */}
      <section className="relative bg-gradient-to-r from-rose-950 via-stone-900 to-rose-950 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.pexels.com/photos/5447529/pexels-photo-5447529.jpeg?auto=compress&cs=tinysrgb&h=600&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-300/20 text-amber-300 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-4">
              <Sparkles className="w-4 h-4" />
              NEW FEATURE
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
              See Yourself in Every Saree
            </h2>
            <p className="text-stone-300 text-lg mb-6 max-w-xl">
              Upload your photo and our virtual try-on room shows you exactly how each saree looks on you. No more guessing — just drape, see, and decide.
            </p>
            <Link
              to="/try-on"
              className="inline-flex items-center gap-2 bg-amber-300 text-stone-900 px-7 py-3.5 rounded-full font-medium hover:bg-amber-200 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Try It Now
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/7176438/pexels-photo-7176438.jpeg?auto=compress&cs=tinysrgb&h=500&w=400"
                alt="Virtual try-on preview"
                className="rounded-2xl shadow-2xl w-72 h-96 object-cover border-4 border-white/20"
              />
              <div className="absolute -bottom-4 -right-4 bg-amber-300 text-stone-900 px-4 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2">
                <Camera className="w-4 h-4" />
                AI Try-On
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-rose-700 text-sm font-medium tracking-[0.2em] uppercase mb-2">Shop by Collection</p>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900">Find Your Perfect Drape</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {collections.map((col) => (
            <Link key={col.name} to={`/shop?category=${col.name}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden">
              <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                <h3 className="text-white font-serif text-xl mb-1">{col.name}</h3>
                <p className="text-white/70 text-sm">{col.tagline}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-amber-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 px-4 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-rose-700 text-sm font-medium tracking-[0.2em] uppercase mb-2">Curated for you</p>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900">Featured Sarees</h2>
            </div>
            <Link to="/shop" className="text-rose-700 font-medium hover:text-rose-900 transition-colors inline-flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-rose-700 text-sm font-medium tracking-[0.2em] uppercase mb-2">Loved by thousands</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900">Bestsellers</h2>
          </div>
          <Link to="/shop" className="text-rose-700 font-medium hover:text-rose-900 transition-colors inline-flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 px-4 bg-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-rose-700 text-sm font-medium tracking-[0.2em] uppercase mb-2">Just landed</p>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900">New Arrivals</h2>
            </div>
            <Link to="/shop" className="text-rose-700 font-medium hover:text-rose-900 transition-colors inline-flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Scissors, title: 'Handcrafted Quality', desc: 'Each saree is woven by skilled artisans using traditional techniques passed down through generations.' },
            { icon: Truck, title: 'Free Shipping', desc: 'Complimentary shipping across India on all orders. International shipping available.' },
            { icon: ShieldCheck, title: 'Authentic Guarantee', desc: 'Every saree comes with a certificate of authenticity. 100% genuine silk and fabrics.' },
          ].map((f) => (
            <div key={f.title} className="text-center p-8 rounded-2xl hover:bg-stone-50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-7 h-7 text-rose-700" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-stone-900 mb-2">{f.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&h=800&w=1920" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-stone-900/70" />
        </div>
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Begin Your Saree Journey</h2>
          <p className="text-white/80 text-lg mb-8">Explore our collection of over 500+ sarees, each with a story to tell.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-amber-300 text-stone-900 px-8 py-4 rounded-full font-medium hover:bg-amber-200 transition-colors">
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
