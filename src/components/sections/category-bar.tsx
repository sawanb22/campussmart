import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import {
  Ruler,
  Armchair,
  Circle,
  Brain,
  Monitor,
  Building2,
  Microscope,
  Users,
  Lightbulb,
  GraduationCap,
  BookOpen,
  Cpu,
  Wrench,
  ShieldCheck,
  Globe,
  Rocket,
  Sparkles,
  Layers,
  Trophy,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Ruler,
  Armchair,
  Circle,
  Brain,
  Monitor,
  Building2,
  Microscope,
  Users,
  Lightbulb,
  GraduationCap,
  BookOpen,
  Cpu,
  Wrench,
  ShieldCheck,
  Globe,
  Rocket,
  Sparkles,
  Layers,
  Trophy,
  Palette,
};

export interface CategoryItem {
  icon: string;
  label: string;
  href: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { icon: 'Ruler', label: 'Campus Design', href: '/campus-design' },
  { icon: 'Armchair', label: 'Furniture', href: '/furniture' },
  { icon: 'Circle', label: 'Sports Infra', href: '/sports-infra' },
  { icon: 'Brain', label: 'AI/ML', href: '/ai-ml' },
  { icon: 'Monitor', label: 'Tech Infra', href: '/tech-infra' },
  { icon: 'Building2', label: 'Libraries', href: '/libraries' },
  { icon: 'Microscope', label: 'Labs', href: '/labs' },
  { icon: 'Users', label: 'Collaboration', href: '/collaboration' },
  { icon: 'Lightbulb', label: 'Innovation', href: '/innovation-centres' },
];

const CategoryBar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const { content } = useSiteContent();

  const categories: CategoryItem[] = (
    content.home_categories && Array.isArray(content.home_categories) && content.home_categories.length > 0
  )
    ? content.home_categories
    : DEFAULT_CATEGORIES;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 0.6, ease: 'power2.out' }
      );
      gsap.fromTo(
        iconsRef.current?.children || [],
        { y: 40, scale: 0.5, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.7, ease: 'back.out(1.7)' }
      );
    });
    return () => ctx.revert();
  }, [categories]);

  return (
    <div
      ref={containerRef}
      className="category-bar bg-white border-b border-gray-100 pb-0 relative z-[60]"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          ref={iconsRef}
          className="grid grid-cols-3 items-start gap-x-0 gap-y-2 pt-3 pb-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:pt-2 sm:pb-2 md:gap-6"
        >
          {categories.map(({ icon, label, href }) => {
            const Icon = CATEGORY_ICONS[icon] || Circle;
            return (
              <div key={label} className="relative group min-w-0 cursor-pointer shrink-0">
                <Link to={href} className="flex flex-col items-center justify-center gap-1.5 px-0 hover:text-cm-blue transition-colors sm:px-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-600 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-cm-blue sm:h-12 sm:w-12 md:h-14 md:w-14">
                    <Icon className="h-5 w-5 sm:h-5 sm:w-5 md:h-7 md:w-7" />
                  </div>
                  <span className="text-[12px] leading-tight font-bold text-center text-gray-700 tracking-tight uppercase transition-colors group-hover:text-cm-blue sm:whitespace-nowrap sm:text-[12px] md:text-[14px]">
                    {label}
                  </span>

                  <div className="absolute -bottom-[8px] left-0 h-[3px] w-full origin-center scale-x-0 bg-cm-yellow transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
