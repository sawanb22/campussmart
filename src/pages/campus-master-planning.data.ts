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

export const MASTER_PLANNING_DEFAULTS = {
  heroTitle: 'Campus Master Planning',
  heroSubtitle:
    'Visionary campus planning from concept to construction — a single master plan that sequences land, buildings and budget into a campus built to inspire generations.',
  heroImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=85',
  section2Title: 'Our Planning Services',
  cards: [
    {
      title: 'Site & Feasibility Studies',
      description: 'Topography, soil and infrastructure surveys that tell you exactly what a site can support before you commit to it.',
      image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=700&q=85',
      categories: ['Feasibility'],
    },
    {
      title: 'Master Plan Development',
      description: 'A single, coherent land-use plan that sequences academic blocks, hostels, sports and green space around how a campus actually runs.',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=700&q=85',
      categories: ['Master Plan'],
    },
    {
      title: 'Zoning & Land Use Planning',
      description: 'Clear zoning for academic, residential, recreational and utility areas that keeps a growing campus organised, not congested.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=85',
      categories: ['Zoning'],
    },
    {
      title: 'Phased Development Roadmaps',
      description: 'Multi-year rollout plans that sequence construction phases against enrolment growth and available budget.',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=85',
      categories: ['Roadmaps'],
    },
    {
      title: 'Infrastructure & Utility Planning',
      description: 'Power, water, drainage and network backbone planned alongside the buildings they serve, not bolted on afterwards.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=85',
      categories: ['Infrastructure'],
    },
    {
      title: 'Regulatory & Approval Support',
      description: 'Navigating statutory approvals and compliance requirements so your plan is buildable, not just beautiful.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=85',
      categories: ['Compliance'],
    },
  ] as MasterPlanningCard[],
  ctaTitle: 'Ready to Plan Your Campus?',
  ctaSubtitle: 'Tell us about your site and growth goals — our planning team will get back to you within 2 business days.',
};
