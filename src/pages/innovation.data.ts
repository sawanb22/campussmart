export interface InnovationCard {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  categories?: string[];
  readTime?: string;
  author?: string;
  authorImage?: string;
  href?: string;
  slug?: string;
}

export interface MoreCard {
  title: string;
  category: string;
  href?: string;
  image?: string;
  description?: string;
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
  brandName: 'CampusMart Innovation',
  headerActionLabel: 'Explore Incubation Models',
  headerActionHref: '/partnership',
  navLinks: ['Ideation', 'Incubation', 'Acceleration', 'Funding', 'Resources'],
  pageTitle: 'Campus Innovation & Startup Journal',
  categories: ['All tracks', 'Ideation', 'Incubation', 'Acceleration', 'Funding', 'Ecosystem'],
  featured: {
    eyebrow: 'Featured Innovation Hub',
    title: 'Building a self-sustaining campus startup ecosystem',
    description: 'A practical blueprint for institutions designing maker labs, venture studios, and funding pipelines for student founders.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85',
    href: '/innovation/ideation-research',
    readMoreLabel: 'Explore the track',
  },
  cards: [
    {
      category: 'Ideation',
      readTime: '5 min read',
      title: 'Ideation & Problem Validation Workshops',
      description: 'Structured workshops and mentor office hours that turn early, half-formed ideas into validated problem statements worth building.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      author: 'CampusMart Team',
      authorImage: '',
      href: '/innovation/ideation-research',
    },
    {
      category: 'Incubation',
      readTime: '6 min read',
      title: 'Incubation Support & Rapid Prototyping',
      description: 'Dedicated desk space, seed funding pathways and technical mentors to help student teams build their first working prototype.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      author: 'CampusMart Team',
      authorImage: '',
      href: '/innovation/incubation-support',
    },
    {
      category: 'Acceleration',
      readTime: '4 min read',
      title: 'Acceleration Programme & Market Testing',
      description: 'A time-boxed sprint with industry mentors and investor exposure to push validated teams toward their first paying customers.',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      author: 'CampusMart Team',
      authorImage: '',
      href: '/innovation/acceleration-programme',
    },
    {
      category: 'Funding',
      readTime: '5 min read',
      title: 'Market Access & Student Grant Networks',
      description: 'Investor connect days, grant application support and distribution partnerships that get real products in front of real customers.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      author: 'CampusMart Team',
      authorImage: '',
      href: '/innovation/market-access-funding',
    },
    {
      category: 'Ecosystem',
      readTime: '7 min read',
      title: 'Managed Campus Innovation Hubs',
      description: 'A fully equipped, staffed innovation centre on your own campus — we handle setup, tooling and day-to-day operations.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      author: 'CampusMart Team',
      authorImage: '',
      href: '/innovation/managed-innovation-hubs',
    },
    {
      category: 'Ecosystem',
      readTime: '5 min read',
      title: 'Venture Studio Launchpad & Legal Support',
      description: 'A structured path from validated prototype to registered company, with legal, financial and go-to-market support built in.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      author: 'CampusMart Team',
      authorImage: '',
      href: '/innovation/venture-studio-launchpad',
    },
  ] as InnovationCard[],
  moreTitle: 'More innovation resources',
  moreCards: [
    {
      category: 'Campus planning',
      title: 'Design spaces where students invent',
      description: 'Shape learning environments around real prototyping journeys.',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=85',
      href: '/campus-master-planning',
    },
    {
      category: 'Robotics & STEM',
      title: 'High-performance prototyping lab equipment',
      description: '3D printers, laser cutters, CNC bays and electronics benches.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85',
      href: '/labs',
    },
    {
      category: 'Partnership',
      title: 'Corporate innovation challenges & sponsorships',
      description: 'Connect student teams with industry problems and mentorship.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85',
      href: '/partnership',
    },
  ] as MoreCard[],
  footerDescription: 'Practical guidance for education leaders, faculty mentors and student founders building the next generation of ventures.',
  footerColumns: [
    { title: 'Tracks', links: ['Ideation', 'Incubation', 'Acceleration', 'Funding'] },
    { title: 'Ecosystem', links: ['About CampusMart', 'Contact', 'Partnerships'] },
    { title: 'Connect', links: ['LinkedIn', 'Instagram', 'YouTube'] },
  ],
  copyright: '© 2026 CampusMart. All rights reserved.',
};
