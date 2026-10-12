export interface AiMlCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export interface AiMlStyles {
  headingFont?: 'playfair' | 'grotesk' | 'poppins' | 'opensans' | 'system';
  bodyFont?: 'opensans' | 'poppins' | 'grotesk' | 'system';
  primaryColor?: string;
  heroBg?: 'amber' | 'slate' | 'blue' | 'white' | 'stone' | string;
  ctaBg?: 'stone' | 'blue' | 'amber' | 'slate' | string;
  heroLayout?: 'split-right' | 'split-left' | 'centered';
  cardColumns?: '2' | '3' | '4';
  showFeatured?: boolean;
  showFilters?: boolean;
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
