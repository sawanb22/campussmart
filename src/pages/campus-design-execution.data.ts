export interface CampusDesignExecutionCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const CDE_PAGE_SLUG = 'campus-design-execution';

export function slugifyStepTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'step'
  );
}

export const CDE_DEFAULTS = {
  heroTitle: 'Design & Execution',
  heroSubtitle:
    'A single accountable team from first site visit to final handover — planning, design and on-ground construction for campuses that get built on time.',
  cards: [
    {
      title: 'Master Planning & Site Analysis',
      description:
        'Topography, footfall and growth studies that turn a raw site into a phased master plan built around how your campus will actually be used.',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
      categories: ['Planning'],
    },
    {
      title: 'Architectural & Interior Design',
      description:
        'Concept-to-working drawings for academic blocks, labs and common areas, balancing daylight, acoustics and NEP-ready classroom layouts.',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
      categories: ['Design'],
    },
    {
      title: 'Construction & Site Execution',
      description:
        'Vetted contractors and a dedicated site engineer keep every phase on schedule, with weekly progress reporting back to your team.',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
      categories: ['Execution'],
    },
    {
      title: 'MEP & Technical Infrastructure',
      description: 'Electrical, plumbing and network backbone planned alongside construction, not bolted on afterwards.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
      categories: ['Infrastructure'],
    },
    {
      title: 'Landscape & Outdoor Design',
      description: 'Courtyards, walkways and green zones that hold up to daily campus traffic.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
      categories: ['Landscape'],
    },
    {
      title: 'Handover & Quality Assurance',
      description: 'Snag-free handover with full documentation, warranties and defect-liability support.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80',
      categories: ['Handover'],
    },
  ] as CampusDesignExecutionCard[],
};
