export interface ArVrCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export interface ArVrStyles {
  headingFont?: 'playfair' | 'grotesk' | 'poppins' | 'opensans' | 'system';
  bodyFont?: 'opensans' | 'poppins' | 'grotesk' | 'system';
  primaryColor?: string;
  heroBg?: 'white' | 'amber' | 'slate' | 'blue' | 'stone' | string;
  ctaBg?: 'blue' | 'stone' | 'amber' | 'slate' | string;
  heroLayout?: 'minimal' | 'split-right' | 'split-left' | 'centered';
  cardColumns?: '2' | '3' | '4';
  showFeatured?: boolean;
  showFilters?: boolean;
}

export const AR_VR_PAGE_SLUG = 'ar-vr-experiences';

export function slugifyArVrTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'experience'
  );
}

