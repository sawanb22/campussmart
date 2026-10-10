import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export interface ServiceItem {
  title: string;
  description?: string;
  href: string;
  bgColor?: string;
  textColor?: string;
  icon?: any;
}

export const defaultServices: ServiceItem[] = [
  { title: 'Furniture Design+ Supply', bgColor: '#ef4444', textColor: '#ffffff', href: '/furniture-design-supply' },
  { title: 'Campus Design+ Execution', bgColor: '#a3e635', textColor: '#000000', href: '/campus-design-execution' },
  { title: 'Sports Design+ Execution', bgColor: '#06b6d4', textColor: '#ffffff', href: '/sports-design-execution' },
  { title: 'AI/Digital Design+ Supply', bgColor: '#a855f7', textColor: '#ffffff', href: '/ai-digital-design-supply' },
];

const ServiceCards = () => {
  const { content } = useSiteContent();
  const rawServices = content.home_services;
  
  // If home_services is explicitly configured as an array (even if empty []), respect it.
  // Only fall back to defaultServices if never configured in DB (undefined / null).
  const services: ServiceItem[] = Array.isArray(rawServices)
    ? rawServices
    : (rawServices === undefined || rawServices === null ? defaultServices : []);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!services || services.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (!cards) return;

      gsap.fromTo(
        cards,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
    return () => ctx.revert();
  }, [services]);

  // If the admin deliberately removed all service cards, do not render an empty container
  if (!services || services.length === 0) {
    return null;
  }

  const colClass = services.length === 1
    ? 'grid-cols-1'
    : services.length === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : services.length === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div ref={containerRef} className="w-full bg-white border-b border-gray-100">
      <div ref={cardsRef} className={`grid ${colClass}`}>
        {services.map((service, index) => {
          const bg = service.bgColor || ['#ef4444', '#a3e635', '#06b6d4', '#a855f7'][index % 4];
          const text = service.textColor || '#ffffff';
          const link = service.href || '/';

          return (
            <Link
              key={`${service.title}-${index}`}
              to={link}
              className="service-card group relative flex items-center justify-between px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-200 hover:brightness-105 min-h-[44px] sm:min-h-[48px]"
              style={{ backgroundColor: bg, color: text }}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-75 shrink-0">
                  0{index + 1}
                </span>
                <h3 className="font-bold text-xs sm:text-sm tracking-tight truncate">
                  {service.title}
                </h3>
              </div>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:bg-black/20 shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCards;
