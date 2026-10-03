export interface ScienceTechLabsCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const SCIENCE_TECH_LABS_PAGE_SLUG = 'science-tech-labs';

export function slugifyScienceLabTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lab'
  );
}

export const SCIENCE_TECH_LABS_DEFAULTS = {
  heroTitle: 'Labs Built for Real Discovery',
  heroSubtitle:
    'Fully equipped science and technology labs designed around the way students actually learn — by testing, measuring and building things themselves.',
  cards: [
    {
      title: 'Physics Laboratories',
      description: 'Precision instrumentation and safe experiment stations for mechanics, optics and electromagnetism practicals.',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=900&q=85',
      categories: ['Physics'],
    },
    {
      title: 'Chemistry Laboratories',
      description: 'Fume hoods, safe storage and full wet-lab benches built to the safety standards a real chemistry programme needs.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85',
      categories: ['Chemistry'],
    },
    {
      title: 'Biology & Life Sciences Labs',
      description: 'Microscopy stations and specimen storage for hands-on cell biology, genetics and life-science coursework.',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85',
      categories: ['Biology'],
    },
    {
      title: 'Computer Science Labs',
      description: 'Networked workstations and dev environments for programming, data structures and systems coursework.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=85',
      categories: ['Computer Science'],
    },
    {
      title: 'Electronics & Robotics Labs',
      description: 'Soldering stations, component libraries and test benches for circuit design and embedded systems projects.',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=900&q=85',
      categories: ['Electronics'],
    },
    {
      title: 'STEM Integration Labs',
      description: 'Flexible, multidisciplinary spaces where physics, coding and design come together in a single project brief.',
      image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=85',
      categories: ['STEM'],
    },
  ] as ScienceTechLabsCard[],
};
