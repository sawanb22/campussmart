import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LayoutGrid, Ruler, Trophy, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import { MediaImage } from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';

gsap.registerPlugin(ScrollTrigger);

const DEFAULTS = {
    heroTitle: 'Our Services',
    heroSubtitle: 'Comprehensive campus transformation services from master planning to final execution.',
    cards: [
        {
            title: 'Campus Design & Execution',
            description: 'Comprehensive master planning and architectural design services tailoring educational spaces for future-ready learning.',
            href: '/campus-design-execution',
            color: 'bg-blue-600'
        },
        {
            title: 'Furniture Design & Supply',
            description: 'Ergonomic and modular furniture solutions for classrooms, laboratories, libraries, and administrative offices.',
            href: '/furniture-design-supply',
            color: 'bg-cm-green'
        },
        {
            title: 'Sports Design & Execution',
            description: 'Premier sports infrastructure including synthetic tracks, indoor courts, and outdoor recreational areas.',
            href: '/sports-design-execution',
            color: 'bg-amber-500'
        },
        {
            title: 'AI/Digital Solutions',
            description: 'Physical and digital integrations including smart classes, AI labs, and digital infrastructure for modern education.',
            href: '/ai-digital-design-supply',
            color: 'bg-purple-600'
        }
    ]
};

const Services = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { data, loading } = usePageData('services');

    const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
    const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
    const cardList = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;

    const iconMap: Record<string, any> = {
        'Campus Design & Execution': Ruler,
        'Furniture Design & Supply': LayoutGrid,
        'Sports Design & Execution': Trophy,
        'AI/Digital Solutions': Cpu
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = containerRef.current?.querySelectorAll('.service-card');
            if (cards && cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 24, scale: 0.97 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.45,
                        stagger: 0.08,
                        ease: 'power2.out',
                        clearProps: 'all'
                    }
                );
            }
        }, containerRef);
        return () => ctx.revert();
    }, [cardList]);

    if (loading && !data.cards) {
        return <PageCardGridSkeleton cardCount={4} />;
    }

    return (
        <main className="min-h-screen pt-8 sm:pt-12 pb-10 sm:pb-12 bg-slate-50/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{heroTitle}</h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                        {heroSubtitle}
                    </p>
                </div>

                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch">
                    {cardList.map((service: any, i: number) => {
                        const Icon = iconMap[service.title] || Ruler;
                        const isYellow = service.color === 'bg-cm-yellow';
                        return (
                            <Link 
                                key={i} 
                                to={service.href?.trim() || '/contact-us'} 
                                className="service-card group bg-white border border-slate-200/90 rounded-[1.75rem] shadow-xs hover:shadow-lg hover:border-cm-blue/40 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full min-h-[240px] w-full"
                            >
                                <div className="flex h-full w-full items-start gap-4">
                                    {service.image ? (
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                                            <MediaImage src={service.image} alt={service.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${service.color || 'bg-cm-blue'} flex items-center justify-center ${isYellow ? 'text-slate-900' : 'text-white'} shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs`}>
                                            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col justify-between min-w-0">
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-cm-blue transition-colors leading-tight">
                                                {service.title}
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed mb-4 text-xs sm:text-sm">
                                                {service.description}
                                            </p>
                                        </div>
                                        <span className="text-cm-blue font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-200">
                                            Learn More <span className="text-base">→</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};

export default Services;
