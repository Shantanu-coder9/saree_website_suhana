import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, setCartOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Shop', path: '/shop' },
    { label: 'Collections', path: '/shop' },
    { label: 'Virtual Try-On', path: '/try-on' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-stone-50/95 backdrop-blur-md shadow-md py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${scrolled ? 'bg-rose-900' : 'bg-white/90'}`}>
                <Sparkles className={`w-5 h-5 ${scrolled ? 'text-amber-300' : 'text-rose-900'}`} />
              </div>
              <span className={`text-xl font-serif font-semibold tracking-wide transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
                Suhana
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-rose-600 ${
                    scrolled ? 'text-stone-700' : 'text-white/90'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${scrolled ? 'text-stone-700 hover:bg-stone-200' : 'text-white hover:bg-white/20'}`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className={`relative p-2 rounded-full transition-colors ${scrolled ? 'text-stone-700 hover:bg-stone-200' : 'text-white hover:bg-white/20'}`}
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-full transition-colors ${scrolled ? 'text-stone-700 hover:bg-stone-200' : 'text-white hover:bg-white/20'}`}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="mt-4 animate-slide-down">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees, fabrics, colors..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </form>
          )}
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-stone-50 border-t border-stone-200 mt-3 animate-slide-down">
            <nav className="flex flex-col px-4 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="text-stone-700 font-medium hover:text-rose-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <div className="h-20" />
    </>
  );
}
