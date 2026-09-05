import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
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
              <Link to="/shop" className="btn-secondary px-6 py-2.5 text-sm font-bold">
                View Collections
              </Link>
              <Link to="/request-quote" className="btn-secondary px-6 py-2.5 text-sm font-bold">
                Get Quote
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <img src={heroImage} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark relative z-10" />
          </div>
        </div>
      </section>

      <Shop
        showAllCategories
        categoryPage="furniture"
      />


      {/* Trust Quote */}
      <section className="py-16 bg-cm-blue-dark text-white text-center rounded-t-[4rem] border-t-4 border-cm-yellow/50">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl md:text-3xl font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
            "Infrastructure isn't just about buildings; it's about the tools we give our students to shape their own environments."
          </h3>
          <div className="w-12 h-1 bg-cm-yellow mx-auto mb-4 rounded-full" />
          <div className="font-bold uppercase tracking-widest text-xs text-white/50">Campus Mart Design Philosophy</div>
        </div>
      </section>
    </main>
  );
};

export default Furniture;
