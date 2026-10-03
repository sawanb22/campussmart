export interface SportsInfrastructureCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const SPORTS_INFRASTRUCTURE_PAGE_SLUG = 'sports-infrastructure';

export function slugifySportsInfrastructureTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'facility'
  );
}

export const SPORTS_INFRASTRUCTURE_DEFAULTS = {
  heroTitle: 'Sports Infrastructure',
  heroSubtitle:
    'World-class athletic facilities that nurture champions, wellness and team spirit — built to a competition standard from the ground up.',
  heroImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1100&q=85',
  ctaTitle: 'Build a Campus That Competes.',
  ctaSubtitle: 'Tell us about your site and sport priorities — our infrastructure team will scope a facility plan and budget.',
  ctaButtonLabel: 'Get Project Audit',
  cards: [
    {
      title: 'Basketball & Multi-Court Arenas',
      description: 'Indoor and outdoor courts built to tournament specification, with proper flooring, lighting and markings.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=85',
      categories: ['Courts'],
    },
    {
      title: 'Football & Athletics Grounds',
      description: 'Full-size pitches and running tracks engineered for drainage, turf health and year-round play.',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85',
      categories: ['Outdoor'],
    },
    {
      title: 'Indoor Badminton & Table Tennis Halls',
      description: 'Climate-controlled indoor halls with sprung flooring, sized for training squads and inter-college matches.',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&q=85',
      categories: ['Indoor'],
    },
    {
      title: 'Swimming Pools & Aquatic Centers',
      description: 'Filtration-certified pools with lane markings and deck safety built for both training and recreation.',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=85',
      categories: ['Aquatics'],
    },
    {
      title: 'Kids Play & Recreation Zones',
      description: 'Safety-certified play equipment and soft-fall surfacing designed for younger students.',
      image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=85',
      categories: ['Kids'],
    },
    {
      title: 'Equipment Supply & Turf Maintenance',
      description: 'Ongoing supply of training equipment plus scheduled turf, track and court maintenance programmes.',
      image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=85',
      categories: ['Equipment'],
    },
  ] as SportsInfrastructureCard[],
};
