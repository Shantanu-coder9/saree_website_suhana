import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products, categories, occasions, colors } from '@/data/products';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedOccasion !== 'All' && p.occasion !== selectedOccasion) return false;
      if (selectedColor !== 'All' && p.color !== selectedColor) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.fabric.toLowerCase().includes(q) && !p.color.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'price-low': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-high': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'newest': result = [...result].sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)); break;
    }
    return result;
  }, [selectedCategory, selectedOccasion, selectedColor, sortBy, priceRange, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedOccasion('All');
    setSelectedColor('All');
    setPriceRange([0, 30000]);
    setSearchQuery('');
    setSortBy('featured');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-stone-900 mb-3 text-sm uppercase tracking-wide">Category</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === cat ? 'bg-rose-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-stone-900 mb-3 text-sm uppercase tracking-wide">Occasion</h4>
        <div className="space-y-2">
          {occasions.map((occ) => (
            <button
              key={occ}
              onClick={() => setSelectedOccasion(occ)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedOccasion === occ ? 'bg-rose-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-stone-900 mb-3 text-sm uppercase tracking-wide">Color</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedColor === color ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-stone-900 mb-3 text-sm uppercase tracking-wide">Price Range</h4>
        <div className="px-1">
          <input
            type="range"
            min="0"
            max="30000"
            step="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-rose-700"
          />
          <div className="flex justify-between text-sm text-stone-600 mt-2">
            <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
            <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <button onClick={resetFilters} className="w-full text-sm text-stone-500 hover:text-rose-700 transition-colors py-2">
        Reset all filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-gradient-to-b from-stone-200 to-stone-50 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-3">Our Saree Collection</h1>
        <p className="text-stone-600 max-w-xl mx-auto">Explore our handpicked sarees, each woven with love and tradition.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-white px-4 py-2.5 rounded-full text-sm font-medium border border-stone-200"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <span className="text-stone-600 text-sm">{filtered.length} sarees</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-stone-500">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-24">
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-stone-500 text-lg">No sarees found matching your filters.</p>
                <button onClick={resetFilters} className="mt-4 text-rose-700 font-medium hover:text-rose-900 transition-colors">
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowFilters(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-80 bg-stone-50 z-50 lg:hidden overflow-y-auto p-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-stone-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </>
      )}
    </div>
  );
}
