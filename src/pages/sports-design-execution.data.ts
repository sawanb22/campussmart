export interface SportsDesignExecutionCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const SDE_PAGE_SLUG = 'sports-design-execution';

export function slugifySportsStepTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'phase'
  );
}

export const SDE_DEFAULTS = {
  heroTitle: 'Sports Design & Execution',
  heroSubtitle:
    'Turnkey sports infrastructure engineering — from topographical grading, sub-base civil works, and synthetic surfacing to international tournament certification.',
  cards: [
    {
      title: 'Topographical Survey & Site Feasibility',
      description:
        'Contour mapping, soil bearing capacity tests, and rainwater runoff analysis tailored for all-weather outdoor pitches and complex indoor sports arenas.',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      categories: ['Planning'],
    },
    {
      title: 'Architectural & Regulation Court Layouts',
      description:
        'BWF, FIBA, FIFA, and World Athletics compliant court blueprints, spectator seating geometry, player locker facilities, and illumination lux modeling.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      categories: ['Design'],
    },
    {
      title: 'Sub-base Civil Engineering & Drainage',
      description:
        'Multi-layer crushed aggregate bases, laser-guided grading slopes, perforated perimeter storm drainage, and anti-settlement asphalt sub-bases.',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      categories: ['Civil Works'],
    },
    {
      title: 'Synthetic Turf & Professional Surfacing',
      description:
        'FIFA-grade monofilament artificial grass with silica/EPDM infill, BWF point-elastic polyurethane indoor mats, and ITF certified multi-layered acrylic court surfaces.',
      image: 'https://images.unsplash.com/photo-1529900241451-b06cb41b81dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      categories: ['Surfacing'],
    },
    {
      title: 'Sports Floodlighting & Boundary Enclosures',
      description:
        'High-mast anti-glare sports LED floodlights (300-500 Lux), motorized acoustic arena dividers, heavy-gauge containment fencing, and safety impact padding.',
      image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      categories: ['Infrastructure'],
    },
    {
      title: 'Line Marking, Fixtures & Certification',
      description:
        'Laser-calibrated regulation line markings, tournament-grade posts, hoops, and nets, followed by formal federation compliance certification and defect warranty handover.',
      image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      categories: ['Handover'],
    },
  ] as SportsDesignExecutionCard[],
};
