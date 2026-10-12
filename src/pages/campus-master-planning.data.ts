export interface MasterPlanningCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
}

export const MASTER_PLANNING_PAGE_SLUG = 'campus-master-planning';

export function slugifyMasterPlanningTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'service'
  );
}

