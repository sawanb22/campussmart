export interface AIStationCard {
  title: string;
  description?: string;
  image?: string;
  href?: string;
}

export const AI_STATIONS_PAGE_SLUG = 'ai-stations';

export function slugifyAIStationTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'station'
  );
}

export const AI_STATIONS_DEFAULTS = {
  heroTitle: 'AI Learning Stations',
  heroSubtitle: 'Give every classroom an AI-powered learning hub — adaptive tutoring, real-time analytics and hands-on AI literacy built for K-12 and higher-ed campuses.',
  section1Title: 'AI Learning Features',
  cards: [
    { title: 'Interactive AI Tutors', description: 'Personalized learning experiences powered by AI', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { title: 'Personalized Learning Paths', description: 'Adaptive curriculum tailored to each student', image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80' },
    { title: 'Real-time Analytics', description: 'Track progress with comprehensive data insights', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
    { title: 'Multi-language Support', description: 'Learning in preferred languages with AI assistance', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ] as AIStationCard[],
  ctaTitle: 'Ready to bring AI stations to your campus?',
  ctaSubtitle: 'Talk to our team about piloting AI learning stations tailored to your students and curriculum.',
};
