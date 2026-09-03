import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-rose-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-xl font-serif font-semibold text-white">Suhana</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Bringing the timeless elegance of Indian sarees to your doorstep. Handcrafted by master weavers, curated for the modern woman.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-rose-400 transition-colors">All Sarees</Link></li>
              <li><Link to="/shop?category=Silk" className="hover:text-rose-400 transition-colors">Silk Sarees</Link></li>
              <li><Link to="/shop?category=Chiffon" className="hover:text-rose-400 transition-colors">Chiffon Sarees</Link></li>
              <li><Link to="/shop?category=Designer" className="hover:text-rose-400 transition-colors">Designer Wear</Link></li>
              <li><Link to="/try-on" className="hover:text-rose-400 transition-colors">Virtual Try-On</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-rose-400 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-rose-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide uppercase">Connect</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-rose-400" /> hello@suhana.com</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-rose-400" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-400" /> Mumbai, India</p>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 hover:bg-rose-900 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-stone-800 hover:bg-rose-900 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-6 text-center text-sm text-stone-500">
          <p>© 2026 Suhana. Crafted with love for the women who wear their heritage proudly.</p>
        </div>
      </div>
    </footer>
  );
}
