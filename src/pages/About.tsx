import { Sparkles, Heart, Globe, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="relative h-[40vh] overflow-hidden">
        <img src="https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg?auto=compress&cs=tinysrgb&h=800&w=1920" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-stone-900/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">Our Story</h1>
            <p className="text-white/80 max-w-xl">Preserving tradition, empowering artisans, draping the world in elegance.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-serif text-stone-900 mb-4">The Suhana Journey</h2>
          <p className="text-stone-600 leading-relaxed mb-6">
            Suhana was born from a simple belief: every woman deserves to feel beautiful in a saree that tells her story. Founded in 2018, we began as a small initiative connecting master weavers from Kanchipuram, Banaras, and Chanderi directly with women across the world.
          </p>
          <p className="text-stone-600 leading-relaxed mb-12">
            Today, we offer over 500+ sarees across silk, chiffon, cotton, and designer collections — each handpicked for quality, authenticity, and timeless appeal. Our virtual try-on room brings the boutique experience to your home, letting you see yourself in every saree before you buy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: Heart, title: 'Artisan First', desc: 'We work directly with 200+ weaving families, ensuring fair wages and preserving heritage techniques.' },
            { icon: Award, title: 'Certified Authentic', desc: 'Every silk saree comes with a Silk Mark certification, guaranteeing genuine quality.' },
            { icon: Globe, title: 'Global Reach', desc: 'Shipping to 30+ countries, bringing Indian craftsmanship to women worldwide.' },
            { icon: Sparkles, title: 'Innovation', desc: 'Our virtual try-on room uses cutting-edge technology to revolutionize how you shop for sarees.' },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-2xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <v.icon className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-stone-900 mb-1">{v.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-rose-950 to-stone-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-serif mb-3">Join the Suhana Family</h2>
          <p className="text-stone-300 mb-6 max-w-lg mx-auto">Over 50,000 women have found their perfect saree with us. Your story could be next.</p>
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-3xl font-serif font-bold text-amber-300">50K+</p>
              <p className="text-sm text-stone-400">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-amber-300">500+</p>
              <p className="text-sm text-stone-400">Saree Designs</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-amber-300">200+</p>
              <p className="text-sm text-stone-400">Master Weavers</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-amber-300">30+</p>
              <p className="text-sm text-stone-400">Countries Served</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
