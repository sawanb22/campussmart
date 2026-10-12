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

