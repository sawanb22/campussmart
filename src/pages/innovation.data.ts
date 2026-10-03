export interface InnovationCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const INNOVATION_PAGE_SLUG = 'innovation';

export function slugifyInnovationTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'programme'
  );
}

export const INNOVATION_DEFAULTS = {
  heroTitle: 'Innovation & Startup Programme',
  heroSubtitle: 'A managed platform that takes student ideas from first sketch to a funded, market-ready startup — run on your campus.',
  cards: [
    {
      title: 'Ideation & Research',
      description:
        'Structured workshops and mentor office hours that turn early, half-formed ideas into validated problem statements worth building.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Ideation'],
    },
    {
      title: 'Incubation Support',
      description: 'Dedicated desk space, seed funding pathways and technical mentors to help student teams build their first working prototype.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Incubation'],
    },
    {
      title: 'Acceleration Programme',
      description: 'A time-boxed sprint with industry mentors and investor exposure to push validated teams toward their first paying customers.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Acceleration'],
    },
    {
      title: 'Market Access & Funding',
      description: 'Investor connect days, grant application support and distribution partnerships that get real products in front of real customers.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Funding'],
    },
    {
      title: 'Managed Innovation Hubs',
      description: 'A fully equipped, staffed innovation centre on your own campus — we handle setup, tooling and day-to-day operations.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Ecosystem'],
    },
    {
      title: 'Venture Studio Launchpad',
      description: 'A structured path from validated prototype to registered company, with legal, financial and go-to-market support built in.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Ecosystem'],
    },
    {
      title: 'Global Chapters Network',
      description: 'Connect student founders with partner campuses and alumni founders across our national innovation network.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Ecosystem'],
    },
  ] as InnovationCard[],
  ctaTitle: 'Ready to talk?',
  ctaSubtitle: 'Connect with our programme managers for a walkthrough of what a managed innovation centre looks like on your campus.',
};
