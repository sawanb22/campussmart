import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaUrl } from '@/lib/media-url';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

const HeroBanner = () => {
  const { content } = useSiteContent();
  const rawHero = content.home_hero || {};
  const heroData = {
    eyebrow: rawHero.eyebrow || 'Future-ready campus infrastructure',
    title: rawHero.title || content.hero_title || 'Design. Build.\nDigitize. Operate.\nFuture-Ready Campuses.',
    subtitle: rawHero.subtitle || content.hero_subtitle || 'Physical + Digital',
    ctaLabel: rawHero.ctaLabel || 'Schedule Campus Audit →',
    ctaHref: rawHero.ctaHref || '/contact-us',
    image: rawHero.image || DEFAULT_HERO_IMAGE
  };

  const [bgImageUrl, setBgImageUrl] = useState<string>(() => {
    return resolveMediaUrl(heroData.image) || DEFAULT_HERO_IMAGE;
  });

  useEffect(() => {
    const candidate = resolveMediaUrl(heroData.image) || DEFAULT_HERO_IMAGE;
    const testImg = new Image();
    testImg.src = candidate;
    testImg.onload = () => setBgImageUrl(candidate);
    testImg.onerror = () => setBgImageUrl(DEFAULT_HERO_IMAGE);
  }, [heroData.image]);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
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

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full bg-[#001f52]"
      style={{
        minHeight: '300px',
      }}
    >
      {/* Background Photograph */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />

      {/* Blue Faded Gradient from Left to Right (matches reference Image 2) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(0, 26, 70, 0.97) 0%, rgba(0, 34, 90, 0.94) 30%, rgba(0, 42, 108, 0.78) 48%, rgba(0, 42, 108, 0.35) 68%, rgba(0, 42, 108, 0) 86%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center py-8 sm:py-12 md:py-14">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl text-white">
              <div 
                ref={subtitleRef}
                className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-[#8fc7ff] mb-2 sm:mb-3"
              >
                {heroData.eyebrow || 'Future-ready campus infrastructure'}
              </div>
              
              <h1
                ref={titleRef}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black leading-[1.12] mb-3 text-white"
                style={{ letterSpacing: '-1px' }}
              >
                {String(heroData.title || '').split('\n').map((line: string, index: number, lines: string[]) => (
                  <span key={`${line}-${index}`}>
                    {index === lines.length - 1 ? <span style={{ color: '#8fc7ff' }}>{line}</span> : line}
                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
              </h1>
              
              <p className="text-sm sm:text-base text-white/90 mb-5 max-w-xl leading-relaxed font-medium">
                {heroData.subtitle || 'End-to-end infrastructure and technology solutions that transform universities into intelligent, sustainable and future-ready campuses.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href={heroData.ctaHref || '/contact-us'} 
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 border border-white/60 text-white font-bold rounded-lg hover:bg-white/15 transition-all duration-300 text-xs sm:text-sm shadow-sm"
                >
                  {heroData.ctaLabel || 'Schedule Campus Audit →'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
