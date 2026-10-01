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

const defaultServices: ServiceItem[] = [
  { title: 'Furniture Design+ Supply', bgColor: '#ef4444', textColor: '#ffffff', href: '/furniture-design-supply' },
  { title: 'Campus Design+ Execution', bgColor: '#a3e635', textColor: '#000000', href: '/campus-design-execution' },
  { title: 'Sports Design+ Execution', bgColor: '#06b6d4', textColor: '#ffffff', href: '/sports-design-execution' },
  { title: 'AI/Digital Design+ Supply', bgColor: '#a855f7', textColor: '#ffffff', href: '/ai-digital-design-supply' },
];

const ServiceCards = () => {
  const { content } = useSiteContent();
  const rawServices = content.home_services;
  const services: ServiceItem[] = (Array.isArray(rawServices) && rawServices.length > 0)
    ? rawServices
    : defaultServices;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (!cards) return;

      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 92%',
            toggleActions: 'play none none none',
          },
        }
      );
    });
    return () => ctx.revert();
  }, [services]);

  return (
    <div ref={containerRef} className="w-full bg-white border-b border-gray-100">
      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => {
          const bg = service.bgColor || ['#ef4444', '#a3e635', '#06b6d4', '#a855f7'][index % 4];
          const text = service.textColor || '#ffffff';
          const link = service.href || '/';

          return (
            <Link
              key={`${service.title}-${index}`}
              to={link}
              className="service-card group relative flex items-center justify-between p-6 sm:p-7 transition-all duration-300 hover:brightness-105"
              style={{ backgroundColor: bg, color: text }}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  Featured Solution 0{index + 1}
                </span>
                <h3 className="font-black text-lg sm:text-xl tracking-tight leading-snug">
                  {service.title}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-black/20 shrink-0 ml-3">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCards;
