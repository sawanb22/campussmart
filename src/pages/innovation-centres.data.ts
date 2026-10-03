export interface InnovationCentresCard {
  title: string;
  description: string;
  image?: string;
  href?: string;
  slug?: string;
}

export const INNOVATION_CENTRES_PAGE_SLUG = 'innovation-centres';

export function slugifyInnovationCentreTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space'
  );
}

export const INNOVATION_CENTRES_DEFAULTS = {
  heroTitle: 'Innovation Centres',
  heroSubtitle:
    'Create spaces that foster creativity and innovation. From maker spaces to research labs, we build environments for breakthrough thinking.',
  heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Innovation Solutions',
  cards: [
    { title: 'Maker Spaces', description: 'Collaborative spaces for hands-on creation and experimentation', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Research Labs', description: 'Advanced facilities for student research and discovery', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Innovation Hubs', description: 'Dynamic ecosystems for ideation and prototyping', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Startup Incubators', description: 'Business development spaces for student entrepreneurs', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ] as InnovationCentresCard[],
};
