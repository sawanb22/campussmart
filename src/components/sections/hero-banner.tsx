import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaUrl } from '@/lib/media-url';
import { HomeHeroSkeleton } from '@/components/ui/page-skeleton';

gsap.registerPlugin(ScrollTrigger);

const HeroBanner = () => {
  const { content, loading } = useSiteContent();
  const rawHero = content.home_hero || {};
  const heroData = {
    eyebrow: rawHero.eyebrow || '',
    title: rawHero.title || '',
    subtitle: rawHero.subtitle || '',
    ctaLabel: rawHero.ctaLabel || '',
    ctaHref: rawHero.ctaHref || '/contact-us',
    image: rawHero.image ? (resolveMediaUrl(rawHero.image) || rawHero.image) : ''
  };

  const [bgImageUrl, setBgImageUrl] = useState<string>(() => heroData.image);

  useEffect(() => {
    if (!heroData.image) {
      setBgImageUrl('');
      return;
    }
    const candidate = heroData.image;
    const testImg = new Image();
    testImg.src = candidate;
    testImg.onload = () => setBgImageUrl(candidate);
    testImg.onerror = () => setBgImageUrl('');
  }, [heroData.image]);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      // Subtitle fade in
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        0
      )
        // Title line by line
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        // Paragraph fade in
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          '-=0.4'
        );
    });

    return () => ctx.revert();
  }, []);

  const styles = content.home_styles || {};
  const heroBg = styles.heroBg || 'blue';
  const heroLayout = styles.heroLayout || 'split-right';
  const primaryColor = styles.primaryColor || '#002B66';

  const isLight = heroBg === 'white' || heroBg === 'paper';
  const bgColor =
    heroBg === 'slate' ? '#0f172a' :
    heroBg === 'stone' ? '#1c1917' :
    heroBg === 'amber' ? '#451a03' :
    heroBg === 'white' ? '#ffffff' :
    heroBg === 'paper' ? '#f8f7f4' :
    heroBg.startsWith('#') ? heroBg : '#001f52';

  const gradientOverlay = isLight
    ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 40%, rgba(255, 255, 255, 0.6) 70%, rgba(255, 255, 255, 0.1) 100%)'
    : heroBg === 'slate'
    ? 'linear-gradient(90deg, rgba(15, 23, 42, 0.97) 0%, rgba(15, 23, 42, 0.92) 40%, rgba(15, 23, 42, 0.6) 70%, rgba(15, 23, 42, 0.1) 100%)'
    : heroBg === 'stone'
    ? 'linear-gradient(90deg, rgba(28, 25, 23, 0.97) 0%, rgba(28, 25, 23, 0.92) 40%, rgba(28, 25, 23, 0.6) 70%, rgba(28, 25, 23, 0.1) 100%)'
    : heroBg === 'amber'
    ? 'linear-gradient(90deg, rgba(69, 26, 3, 0.97) 0%, rgba(69, 26, 3, 0.92) 40%, rgba(69, 26, 3, 0.6) 70%, rgba(69, 26, 3, 0.1) 100%)'
    : 'linear-gradient(90deg, rgba(0, 26, 70, 0.97) 0%, rgba(0, 34, 90, 0.94) 30%, rgba(0, 42, 108, 0.78) 48%, rgba(0, 42, 108, 0.35) 68%, rgba(0, 42, 108, 0) 86%)';

  const pyClasses = heroLayout === 'minimal' ? 'py-4 sm:py-6 md:py-8' : 'py-8 sm:py-12 md:py-14';
  const alignClasses =
    heroLayout === 'centered' ? 'max-w-3xl mx-auto text-center' :
    heroLayout === 'split-left' ? 'max-w-2xl ml-auto text-left' :
    'max-w-2xl text-left';

  if (loading) {
    return <HomeHeroSkeleton />;
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full transition-colors"
      style={{
        backgroundColor: bgColor,
        minHeight: heroLayout === 'minimal' ? '220px' : '300px',
      }}
    >
      {/* Background Photograph */}
      {bgImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImageUrl}')` }}
        />
      )}

      {/* Faded Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: gradientOverlay }}
      />

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center ${pyClasses}`}>
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="max-w-6xl mx-auto">
            <div className={alignClasses}>
              {heroData.eyebrow && (
                <div 
                  ref={subtitleRef}
                  className={`text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-widest mb-2 sm:mb-3 ${
                    isLight ? 'text-blue-700' : 'text-[#8fc7ff]'
                  }`}
                >
                  {heroData.eyebrow}
                </div>
              )}
              
              {heroData.title && (
                <h1
                  ref={titleRef}
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black leading-[1.12] mb-3 ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                  style={{ letterSpacing: '-1px' }}
                >
                  {String(heroData.title).split('\n').map((line: string, index: number, lines: string[]) => (
                    <span key={`${line}-${index}`}>
                      {index === lines.length - 1 ? (
                        <span style={{ color: isLight ? primaryColor : '#8fc7ff' }}>{line}</span>
                      ) : line}
                      {index < lines.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
              )}
              
              {heroData.subtitle && (
                <p className={`text-sm sm:text-base mb-5 leading-relaxed font-medium ${
                  heroLayout === 'centered' ? 'max-w-2xl mx-auto' : 'max-w-xl'
                } ${
                  isLight ? 'text-gray-700' : 'text-white/90'
                }`}>
                  {heroData.subtitle}
                </p>
              )}

              {/* Action Buttons */}
              {heroData.ctaLabel && (
                <div className={`flex flex-wrap gap-3 ${heroLayout === 'centered' ? 'justify-center' : ''}`}>
                  <a 
                    href={heroData.ctaHref || '/contact-us'} 
                    className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 border font-bold rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-sm ${
                      isLight
                        ? 'bg-blue-600 text-white border-transparent hover:bg-blue-700'
                        : 'border-white/60 text-white hover:bg-white/15'
                    }`}
                  >
                    {heroData.ctaLabel}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
