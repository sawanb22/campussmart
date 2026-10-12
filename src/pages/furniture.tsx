import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import Shop from '@/pages/shop';

interface FurnitureStyles {
  headingFont?: 'playfair' | 'grotesk' | 'poppins' | 'opensans' | 'system';
  bodyFont?: 'opensans' | 'poppins' | 'grotesk' | 'system';
  primaryColor?: string;
  heroBg?: 'blue' | 'white' | 'amber' | 'slate' | 'stone' | string;
  heroLayout?: 'split-right' | 'split-left' | 'centered' | 'minimal';
}

const Furniture = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData('furniture');

  const styles: FurnitureStyles = {
    headingFont: 'poppins',
    bodyFont: 'opensans',
    primaryColor: '#0047ab',
    heroBg: 'blue',
    heroLayout: 'split-right',
    ...(data.styles || {}),
  };

  const headingFontClass =
    styles.headingFont === 'playfair'
      ? 'font-playfair'
      : styles.headingFont === 'grotesk'
      ? 'font-grotesk'
      : styles.headingFont === 'opensans'
      ? 'font-opensans'
      : styles.headingFont === 'system'
      ? 'font-sans'
      : 'font-poppins';

  const bodyFontClass =
    styles.bodyFont === 'poppins'
      ? 'font-poppins'
      : styles.bodyFont === 'grotesk'
      ? 'font-grotesk'
      : styles.bodyFont === 'system'
      ? 'font-sans'
      : 'font-opensans';

  const primaryColor = styles.primaryColor || '#0047ab';
  const heroBgTheme = styles.heroBg || 'blue';
  const heroBgClass =
    heroBgTheme === 'amber'
      ? 'bg-amber-500 text-white'
      : heroBgTheme === 'slate'
      ? 'bg-slate-900 text-white'
      : heroBgTheme === 'stone'
      ? 'bg-stone-900 text-white'
      : heroBgTheme === 'white'
      ? 'bg-white text-slate-800 border border-slate-200'
      : heroBgTheme.startsWith('#')
      ? 'text-white'
      : 'bg-cm-blue text-white';

  const isHeroLight = heroBgTheme === 'white';
  const heroInlineBg = heroBgTheme.startsWith('#') ? { backgroundColor: heroBgTheme } : undefined;
  const heroLayout = styles.heroLayout || 'split-right';

  const heroButton1Label = data.heroButton1Label || data.heroButtonLabel || '';
  const heroButton1Href = data.heroButton1Href || data.heroButtonHref || '/catalogues';
  const heroButton2Label = data.heroButton2Label || '';
  const heroButton2Href = data.heroButton2Href || '/request-quote';

  useEffect(() => {
    if (loading || !heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, scale: 1.02 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [loading]);

  return (
    <main className={`min-h-screen bg-white ${bodyFontClass}`}>
      {/* Hero Section - 100% Database Driven */}
      {!data.hideHero && (
        <section
          ref={heroRef}
          style={heroInlineBg}
          className={`${heroBgClass} mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-8 md:py-10 overflow-hidden relative shadow-inner transition-colors`}
        >
          {loading ? (
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4 animate-pulse">
              <div className="lg:w-1/2 w-full space-y-3">
                <div className="h-8 w-2/3 rounded-lg bg-white/20" />
                <div className="h-4 w-full rounded bg-white/15" />
                <div className="h-4 w-5/6 rounded bg-white/15" />
                <div className="pt-2 flex gap-4">
                  <div className="h-10 w-36 rounded-xl bg-white/20" />
                  <div className="h-10 w-28 rounded-xl bg-white/20" />
                </div>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="rounded-2xl w-full h-[260px] bg-white/15" />
              </div>
            </div>
          ) : heroLayout === 'centered' ? (
            /* Centered Hero Layout */
            <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
              {data.heroEyebrow && (
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                  style={{ color: isHeroLight ? primaryColor : '#fde047' }}
                >
                  {data.heroEyebrow}
                </span>
              )}
              {data.heroTitle && (
                <h1 className={`${headingFontClass} text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight`}>
                  {data.heroTitle}
                </h1>
              )}
              {data.heroSubtitle && (
                <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto ${isHeroLight ? 'text-slate-600' : 'text-white/85'}`}>
                  {data.heroSubtitle}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {heroButton1Label && (
                  <Link
                    to={heroButton1Href}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="btn-primary px-7 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 inline-flex items-center gap-2"
                  >
                    {heroButton1Label} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {heroButton2Label && (
                  <Link
                    to={heroButton2Href}
                    className="btn-secondary px-7 py-3 text-sm font-bold shadow-md hover:scale-105 transition-all"
                  >
                    {heroButton2Label}
                  </Link>
                )}
              </div>
              {data.heroImage && (
                <div className="mt-8 max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-xl border-2 border-white/20">
                  <MediaImage
                    src={data.heroImage}
                    alt={data.heroTitle || ''}
                    className="w-full h-[280px] sm:h-[320px] object-cover"
                  />
                </div>
              )}
            </div>
          ) : heroLayout === 'minimal' ? (
            /* Minimal Hero Layout (Text Only) */
            <div className="max-w-6xl mx-auto relative z-10 px-6 sm:px-8">
              {data.heroEyebrow && (
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                  style={{ color: isHeroLight ? primaryColor : '#fde047' }}
                >
                  {data.heroEyebrow}
                </span>
              )}
              {data.heroTitle && (
                <h1 className={`${headingFontClass} text-2xl md:text-4xl font-extrabold mb-3 tracking-tight`}>
                  {data.heroTitle}
                </h1>
              )}
              {data.heroSubtitle && (
                <p className={`text-sm md:text-base leading-relaxed max-w-3xl ${isHeroLight ? 'text-slate-600' : 'text-white/85'}`}>
                  {data.heroSubtitle}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-4">
                {heroButton1Label && (
                  <Link
                    to={heroButton1Href}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="btn-primary px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110 inline-flex items-center gap-2"
                  >
                    {heroButton1Label} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {heroButton2Label && (
                  <Link
                    to={heroButton2Href}
                    className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md hover:scale-105 transition-all"
                  >
                    {heroButton2Label}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Split Hero Layout (split-right or split-left) */
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
              <div className={`lg:w-1/2 text-left ${heroLayout === 'split-left' ? 'order-1 lg:order-2' : ''}`}>
                {data.heroEyebrow && (
                  <span
                    className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                    style={{ color: isHeroLight ? primaryColor : '#fde047' }}
                  >
                    {data.heroEyebrow}
                  </span>
                )}
                {data.heroTitle && (
                  <h1 className={`${headingFontClass} text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight`}>
                    {data.heroTitle}
                  </h1>
                )}
                {data.heroSubtitle && (
                  <p className={`text-sm md:text-base leading-relaxed max-w-xl ${isHeroLight ? 'text-slate-600' : 'text-white/85'}`}>
                    {data.heroSubtitle}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-4">
                  {heroButton1Label && (
                    <Link
                      to={heroButton1Href}
                      style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                      className="btn-primary px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110 inline-flex items-center gap-2"
                    >
                      {heroButton1Label} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {heroButton2Label && (
                    <Link
                      to={heroButton2Href}
                      className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md hover:scale-105 transition-all"
                    >
                      {heroButton2Label}
                    </Link>
                  )}
                </div>
              </div>
              {data.heroImage && (
                <div className={`lg:w-1/2 relative w-full ${heroLayout === 'split-left' ? 'order-2 lg:order-1' : ''}`}>
                  <MediaImage
                    src={data.heroImage}
                    alt={data.heroTitle || ''}
                    className="rounded-2xl shadow-xl w-full h-[260px] sm:h-[300px] object-cover border-2 border-white/20 relative z-10"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Live E-Commerce Products & Catalog (Shop) */}
      {!data.hideShop && (
        <Shop
          showAllCategories
          categoryPage="furniture"
          defaultCategorySlug="chairs"
          excludedCategorySlugs={['uncategorized']}
        />
      )}

      {/* Design Philosophy / Quote Section - 100% Database Driven */}
      {!loading && !data.hideQuote && data.quoteText && (
        <section className="py-10 bg-slate-50 text-slate-800 text-center rounded-[2rem] mx-3 sm:mx-6 lg:mx-8 mb-10 border border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className={`${headingFontClass} text-xl md:text-2xl font-bold mb-5 leading-relaxed max-w-2xl mx-auto text-slate-800`}>
              {data.quoteText}
            </h3>
            <div
              className="w-12 h-1 mx-auto mb-3 rounded-full transition-colors"
              style={{ backgroundColor: primaryColor }}
            />
            {data.quoteLabel && (
              <div
                className="font-bold uppercase tracking-widest text-xs transition-colors"
                style={{ color: primaryColor }}
              >
                {data.quoteLabel}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default Furniture;
