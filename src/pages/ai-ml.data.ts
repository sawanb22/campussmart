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
  heroTitle: 'AI & Machine Learning, made classroom-ready',
  heroSubtitle:
    'Learning stations, ML labs and computing infrastructure that give students hands-on experience with real AI tools, not just slides about them.',
  heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=85',
  ctaTitle: 'Ready to deploy AI/ML on your campus?',
  ctaSubtitle: 'Talk to our engineering team about the right mix of stations, labs and compute for your students.',
  ctaButtonLabel: 'Contact Us',
  ctaHref: '/contact-us',
  cards: [
    {
      title: 'AI Learning Stations',
      description: 'Interactive, sensor-equipped stations where students run and tweak real AI models instead of just reading about them.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Learning Stations'],
    },
    {
      title: 'ML Labs',
      description: 'Dedicated lab benches for model training, data pipelines and experimentation, sized for a full class at once.',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Learning Stations'],
    },
    {
      title: 'Coding Platforms',
      description: 'Cloud-ready development environments pre-loaded with the frameworks students need for AI and software projects.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Software Platforms'],
    },
    {
      title: 'Computing Infrastructure',
      description: 'GPU-backed compute and campus networking sized to keep training jobs and simulations running smoothly.',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Infrastructure'],
    },
    {
      title: 'AI Curriculum & Certification',
      description: 'NEP-aligned course modules and assessments that give AI/ML learning a clear, credentialed structure.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Curriculum'],
    },
    {
      title: 'Faculty AI Training',
      description: 'Hands-on workshops that get faculty comfortable teaching and mentoring AI/ML projects, not just supervising them.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Curriculum'],
    },
  ] as AiMlCard[],
};
