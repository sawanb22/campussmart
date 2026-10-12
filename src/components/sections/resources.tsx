import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { MoveUpRight } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaUrl } from '@/lib/media-url';

gsap.registerPlugin(ScrollTrigger);

export interface ResourceItem {
  title: string;
  description: string;
  image: string;
  color: string;
  tag: string;
  href: string;
  active?: boolean;
}

export const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    title: 'Complete Guide on AI Implementation',
    description: 'A comprehensive guide for implementing AI in educational institutions.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    color: '#0ea5e9',
    tag: 'GUIDE',
    href: '/ai-guide',
  },
  {
    title: 'Setting Up a College in India',
    description: 'Step-by-step masterclass to establishing a new college in India.',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    color: '#f59e0b',
    tag: 'HANDBOOK',
    href: '/setup-college',
  },
  {
    title: 'UGC Guidelines for Digital Campus',
    description: 'Latest UGC guidelines for the digital transformation of campuses.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    color: '#10b981',
    tag: 'COMPLIANCE',
    href: '/ugc-guidelines',
  },
  {
    title: 'Product Catalog 25-26',
    description: 'Explore our complete range of furniture, tech, and sports infrastructure.',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800',
    color: '#ef4444',
    tag: 'CATALOGUE',
    href: '/catalogues',
  },
  {
    title: 'Lookbook – Play Furniture',
    description: 'Inspiring play area solutions and ergonomic designs for younger students.',
    image: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?auto=format&fit=crop&q=80&w=800',
    color: '#8b5cf6',
    tag: 'PORTFOLIO',
    href: '/furniture',
  },
  {
    title: '20 Stunning College Buildings',
    description: 'A curated collection of the most breathtaking campus architecture.',
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800',
    color: '#ec4899',
    tag: 'SHOWCASE',
    href: '/20-stunning-college-buildings',
  }
];

const Resources = () => {
  const { content, loading } = useSiteContent();

  const rawResources = content.home_resources || {};
  const heading = rawResources.heading || '';
  const subtitle = rawResources.subtitle || '';
  const rawItems: ResourceItem[] = Array.isArray(rawResources.items) ? rawResources.items : [];
  const items = rawItems.filter((it) => it.active !== false);

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || items.length === 0) return;
    const ctx = gsap.context(() => {
      // Title reveal
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: containerRef.current, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }

      // Cards stagger
      const cards = gridRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }
    });
    return () => ctx.revert();
  }, [loading, items]);

  if (loading) {
    return (
      <section className="py-4 md:py-6 bg-[#f4f3ef] animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-8 w-64 rounded bg-stone-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-stone-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section ref={containerRef} className="py-4 md:py-6 bg-[#f4f3ef] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
          <div className="max-w-2xl">
            <h2 ref={titleRef} className="text-3xl md:text-5xl font-extrabold text-[#12395b] tracking-tight">
              {heading}
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              {subtitle}
            </p>
          </div>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href || '/'}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform-gpu"
            >
              {/* Natural Horizontal Photo (Top section, 100% visible, zero dark tint or overlay) */}
              <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100 flex-shrink-0">
                {item.image && (
                  <img
                    src={resolveMediaUrl(item.image) || item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  />
                )}

                {/* Tag Pin */}
                {item.tag && (
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider shadow z-10"
                    style={{ background: (item.color || '#0ea5e9') + 'EE' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0" />
                    {item.tag}
                  </div>
                )}
              </div>

              {/* Clean Auto-Height White Body */}
              <div className="p-4 sm:p-5 flex flex-col bg-white">
                <h3 className="text-slate-900 font-extrabold text-sm sm:text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line mt-1.5">
                    {item.description}
                  </p>
                )}

                <div className="mt-3 pt-3 flex items-center justify-between border-t border-slate-100">
                  <span
                    className="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    style={{ color: item.color || '#0ea5e9' }}
                  >
                    Read Now <MoveUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>

              {/* Hover border ring */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition-all duration-300 group-hover:ring-2"
                style={{ '--tw-ring-color': item.color || '#0ea5e9' } as React.CSSProperties}
              />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Resources;
