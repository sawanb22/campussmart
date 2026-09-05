import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteContent } from '@/contexts/SiteContentContext';

gsap.registerPlugin(ScrollTrigger);

const HeroBanner = () => {
  const { content } = useSiteContent();
  const heroData = content.home_hero || {
    eyebrow: 'Future-ready campus infrastructure',
    title: 'Design. Build.\nDigitize. Operate.\nFuture-Ready Campuses.',
    subtitle: 'Physical + Digital',
    ctaLabel: 'Schedule Campus Audit →',
    ctaHref: '/contact-us',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  };

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
      className="relative overflow-hidden w-full"
      style={{
        minHeight: '280px',
        backgroundImage: `linear-gradient(90deg,rgba(2,22,50,.96) 0%,rgba(2,22,50,.83) 42%,rgba(2,22,50,.24) 78%), url('${heroData.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl text-white">
              <div 
                ref={subtitleRef}
                className="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-blue-300 mb-2"
              >
                {heroData.eyebrow || 'Future-ready campus infrastructure'}
              </div>
              
              <h1
                ref={titleRef}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-2"
                style={{ letterSpacing: '-1.5px' }}
              >
                {String(heroData.title || '').split('\n').map((line: string, index: number, lines: string[]) => (
                  <span key={`${line}-${index}`}>
                    {index === lines.length - 1 ? <span style={{ color: '#8fc7ff' }}>{line}</span> : line}
                    {index < lines.length - 1 && <br />}
                  </span>
                ))}
              </h1>
              
              <p className="text-sm sm:text-base text-blue-100 mb-3 max-w-3xl leading-snug">
                {heroData.subtitle || 'End-to-end infrastructure and technology solutions that transform universities into intelligent, sustainable and future-ready campuses.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href={heroData.ctaHref || '/contact-us'} 
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 border border-white/50 text-white font-black rounded-md hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm"
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
