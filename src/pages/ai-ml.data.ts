export interface AiMlCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const AI_ML_PAGE_SLUG = 'ai-ml';

export function slugifyAiMlTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'module'
  );
}

export const AI_ML_DEFAULTS = {
  heroTitle: 'AI & Machine Learning',
  heroSubtitle:
    'Cutting-edge AI and ML solutions for educational institutions. Prepare students for the future with hands-on learning experiences.',
  heroImage: '/uploads/media/1788160868601-107085202.jpg',
  ctaTitle: 'Ready to deploy AI/ML on your campus?',
  ctaSubtitle: 'Talk to our engineering team about the right mix of stations, labs and compute for your students.',
  ctaButtonLabel: 'Contact Us',
  ctaHref: '/contact-us',
  cards: [
    {
      title: 'AI Learning Stations',
      description: 'Interactive AI-powered learning environments with pre-configured compute and sensor hardware.',
      image: '/uploads/media/1788162454440-418400010.png',
      categories: ['Learning Stations'],
      slug: 'ai-learning-stations',
    },
    {
      title: 'ML Labs',
      description: 'Machine learning experimentation setups, model training clusters, and student benches.',
      image: '/uploads/media/1788162604444-713305043.jpg',
      categories: ['Learning Stations'],
      slug: 'ml-labs',
    },
  ] as AiMlCard[],
};
