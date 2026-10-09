import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Ruler, Sparkles } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import Shop from '@/pages/shop';

const DEFAULTS = {
  heroTitle: 'Furniture Solutions',
  heroSubtitle: 'Premium quality furniture designed for educational institutions. From classrooms to libraries, we provide durable and ergonomic solutions.',
  heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
};

const Furniture = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('furniture');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power4.out' });
      
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? DEFAULTS.heroImage;
  return (
    <main className="min-h-screen bg-white text-opensans">
      {/* Elegant Hero - Side by Side Corporate Style */}
      <section ref={heroRef} className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 text-left text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-snug max-w-xl">
              {heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/catalogues" className="btn-secondary px-6 py-2.5 text-sm font-bold">
                View Collections
              </Link>
              <Link to="/request-quote" className="btn-secondary px-6 py-2.5 text-sm font-bold">
                Get Quote
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <MediaImage src={heroImage} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark relative z-10" />
          </div>
        </div>
      </section>

      {/* Furniture Highlights & Key Institutional Standards */}
      <section className="max-w-6xl mx-auto px-4 mt-6 mb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-cm-blue flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">BIFMA / ISO Certified</h4>
              <p className="text-[11px] text-slate-500">Institutional durability grade</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-cm-blue flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Custom Dimensions</h4>
              <p className="text-[11px] text-slate-500">Tailored to room layouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-cm-blue flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Ergonomic Posture</h4>
              <p className="text-[11px] text-slate-500">Optimized student comfort</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-cm-blue flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Turnkey Installation</h4>
              <p className="text-[11px] text-slate-500">Pan-India delivery & assembly</p>
            </div>
          </div>
        </div>
      </section>

      <Shop
        showAllCategories
        categoryPage="furniture"
        hideAllCategoriesOption
        defaultCategorySlug="chairs"
        excludedCategorySlugs={['uncategorized']}
      />


      {/* Trust Quote */}
      <section className="py-10 bg-slate-50 text-slate-800 text-center rounded-[2rem] mx-3 sm:mx-6 lg:mx-8 mb-10 border border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl md:text-2xl font-bold mb-5 leading-relaxed max-w-2xl mx-auto text-slate-800">
            "Infrastructure isn't just about buildings; it's about the tools we give our students to shape their own environments."
          </h3>
          <div className="w-12 h-1 bg-cm-yellow mx-auto mb-3 rounded-full" />
          <div className="font-bold uppercase tracking-widest text-xs text-cm-blue">Campus Mart Design Philosophy</div>
        </div>
      </section>
    </main>
  );
};

export default Furniture;
