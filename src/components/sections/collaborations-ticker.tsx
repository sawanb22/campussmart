import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Landmark, GraduationCap, Library, TestTube } from 'lucide-react';
import { useSiteContent } from '../../contexts/SiteContentContext';
import { HomeCollaborationsSkeleton } from '@/components/ui/page-skeleton';

gsap.registerPlugin(ScrollTrigger);

const PARTNER_ICONS = [Landmark, TestTube, Library, Building2, GraduationCap];

const CollaborationsTicker = () => {
    const { content, loading } = useSiteContent();
    const containerRef = useRef<HTMLDivElement>(null);

    const rawCollabs = Array.isArray(content.collaborations)
        ? content.collaborations.filter((c: any) => c && c.active !== false && c.name)
        : [];

    const collaborations = rawCollabs.map((c: any, i: number) => ({
        name: c.name,
        icon: PARTNER_ICONS[i % PARTNER_ICONS.length] || Building2
    }));

    useEffect(() => {
        if (loading || collaborations.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        return () => ctx.revert();
    }, [loading, collaborations.length]);

    if (loading) {
        return <HomeCollaborationsSkeleton />;
    }

    if (collaborations.length === 0) {
        return null;
    }

    return (
        <section ref={containerRef} className="py-8 bg-gray-50 border-y border-gray-200 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex justify-center">
                <h3 className="text-xs md:text-sm font-bold text-gray-500 tracking-[0.2em] uppercase">
                    {content.collaborations_title || 'Trusted By Leading Institutions Worldwide'}
                </h3>
            </div>

            {/* Infinite scrolling marquee container */}
            <div className="relative flex overflow-hidden">
                {/* Left gradient mask */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />

                {/* Marquee Track */}
                <div className="flex animate-marquee gap-4 md:gap-8 items-center whitespace-nowrap px-6">
                    {/* First set of items */}
                    {collaborations.map((collab: any, i: number) => (
                        <div key={`collab-1-${i}`} className="flex items-center gap-3">
                            <collab.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                            <span className="text-sm md:text-base font-semibold text-gray-400">{collab.name}</span>
                        </div>
                    ))}
                    {/* Duplicate set for seamless looping */}
                    {collaborations.map((collab: any, i: number) => (
                        <div key={`collab-2-${i}`} className="flex items-center gap-3">
                            <collab.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                            <span className="text-sm md:text-base font-semibold text-gray-400">{collab.name}</span>
                        </div>
                    ))}
                </div>

                {/* Right gradient mask */}
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
};

export default CollaborationsTicker;
