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

