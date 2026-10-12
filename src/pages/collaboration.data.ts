export interface CollaborationCard {
  title: string;
  description?: string;
  image?: string;
  href?: string;
  slug?: string;
}

export const COLLAB_PAGE_SLUG = 'collaboration';

export function slugifyCollabTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space'
  );
}
