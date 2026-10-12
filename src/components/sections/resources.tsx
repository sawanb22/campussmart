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

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href || '/'}
              className="group relative h-[200px] rounded-2xl overflow-hidden cursor-pointer block transform-gpu"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={resolveMediaUrl(item.image) || item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Tag Pin */}
              <div className="absolute top-3 left-3 z-10">
                <span
                  className="px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest text-white border border-white/20 uppercase shadow"
                >
                  {item.tag}
                </span>
              </div>

              {/* Bottom Read More Box — clean flat dark glass with zero gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 bg-slate-950/75 backdrop-blur-md border-t border-white/10 z-10">
                <h3 className="text-white font-extrabold text-sm sm:text-base md:text-lg leading-tight mb-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold uppercase tracking-widest flex items-center gap-1"
                    style={{ color: item.color }}
                  >
                    Read Now <MoveUpRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Resources;
