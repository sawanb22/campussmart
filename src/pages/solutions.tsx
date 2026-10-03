import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Beaker, BookOpen, Lightbulb, Users, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageData } from '@/hooks/usePageData';
import { MediaImage } from '@/components/ui/media-image';

gsap.registerPlugin(ScrollTrigger);

const DEFAULTS = {
    heroTitle: 'Functional Solutions',
    heroSubtitle: 'Specialized environments optimized for specific learning outcomes and operational efficiency.',
    cards: [
        {
            title: 'Laboratories',
            description: 'Advanced science and technology labs equipped with modern safety and learning tools.',
            href: '/labs',
            color: 'bg-cm-blue'
        },
        {
            title: 'Libraries',
            description: 'Next-generation libraries combining traditional resources with digital learning environments.',
            href: '/libraries',
            color: 'bg-amber-500'
        },
        {
            title: 'Innovation Centres',
            description: 'Dedicated spaces for creative thinking, prototyping, and interdisciplinary collaboration.',
            href: '/innovation-centres',
            color: 'bg-emerald-600'
        },
        {
            title: 'Learning Environments',
            description: 'Flexible classrooms and open spaces designed for active, collaborative learning.',
            href: '/new-environments',
            color: 'bg-orange-500'
        },
        {
            title: 'AI Stations',
            description: 'Dedicated hubs for artificial intelligence exploration and digital literacy.',
            href: '/ai-stations',
            color: 'bg-purple-600'
        }
    ]
};

const Solutions = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { data } = usePageData('solutions');

    const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
    const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
    const cardList = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;

    const iconMap: Record<string, any> = {
        'Laboratories': Beaker,
        'Libraries': BookOpen,
        'Innovation Centres': Lightbulb,
        'Learning Environments': Users,
        'AI Stations': Monitor
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = containerRef.current?.querySelectorAll('.solution-card');
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

    return (
        <main className="min-h-screen pt-8 sm:pt-12 pb-10 sm:pb-12 bg-slate-50/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{heroTitle}</h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
                        {heroSubtitle}
                    </p>
                </div>

                <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {cardList.map((sol: any, i: number) => {
                        const Icon = iconMap[sol.title] || Beaker;
                        const isYellow = sol.color === 'bg-cm-yellow';
                        return (
                            <Link 
                                key={i} 
                                to={sol.href?.trim() || '/contact-us'} 
                                className="solution-card group bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-lg hover:border-cm-blue/40 transition-all duration-200 overflow-hidden flex flex-col justify-between"
                            >
                                <div className={`h-2 ${sol.color || 'bg-cm-blue'}`} />
                                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        {sol.image ? (
                                            <div className="w-12 h-12 rounded-xl overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                                                <MediaImage src={sol.image} alt={sol.title} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className={`w-12 h-12 rounded-xl ${sol.color || 'bg-cm-blue'} flex items-center justify-center ${isYellow ? 'text-slate-900' : 'text-white'} mb-6 group-hover:scale-105 transition-transform duration-200 shadow-xs`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-cm-blue transition-colors">
                                            {sol.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                            {sol.description}
                                        </p>
                                    </div>
                                    <span className="text-cm-blue font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 group-hover:translate-x-1 transition-transform duration-200">
                                        View Details <span className="text-base">→</span>
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};

export default Solutions;
