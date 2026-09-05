export interface InnovationCentersCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
}

export const INNOVATION_CENTERS_PAGE_SLUG = 'innovation-centers';

export function slugifyInnovationCenterTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space'
  );
}

export const INNOVATION_CENTERS_DEFAULTS = {
  heroTitle: 'Spaces Built for Breakthrough Thinking',
  heroSubtitle:
    'From first prototype to first pitch, explore the maker spaces, labs and studios that turn a campus innovation centre into somewhere students actually want to build.',
  cards: [
    {
      title: 'Maker & Prototyping Studios',
      description: 'Tool walls, 3D printers and workbenches where an idea can go from sketch to working prototype in an afternoon.',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=85',
      categories: ['Maker Spaces'],
    },
    {
      title: 'Startup Incubation Bays',
      description: 'Dedicated desks, mentor hours and seed funding pathways for the student teams ready to turn a project into a company.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85',
      categories: ['Incubation'],
    },
    {
      title: 'Robotics & IoT Labs',
      description: 'Sensor kits, microcontrollers and open bench space for teams building the next connected-device project.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=85',
      categories: ['Robotics'],
    },
    {
      title: 'Design Thinking Studios',
      description: 'Whiteboard walls and modular furniture built for the messy, iterative work of user research and rapid ideation.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=85',
      categories: ['Design'],
    },
    {
      title: 'Research & Innovation Cells',
      description: 'Quiet, well-equipped rooms for faculty-led research projects that need more focus than a shared lab allows.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85',
      categories: ['Research'],
    },
    {
      title: 'Industry Collaboration Hubs',
      description: 'Meeting and demo space designed for the site visits, sponsor reviews and industry mentoring that keep projects grounded.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85',
      categories: ['Collaboration'],
    },
  ] as InnovationCentersCard[],
};
