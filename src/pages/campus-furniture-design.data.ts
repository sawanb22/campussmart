export interface FurnitureDesignCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const FURNITURE_DESIGN_PAGE_SLUG = 'campus-furniture-design';

export function slugifyFurnitureDesignTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'range'
  );
}

export const FURNITURE_DESIGN_DEFAULTS = {
  heroTitle: 'Campus Furniture Design',
  heroSubtitle:
    'Thoughtfully engineered, ergonomic furniture that elevates the academic experience — from classroom seating to library shelving, hostel furnishing and custom builds for every corner of your campus.',
  heroImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=85',
  cards: [
    {
      title: 'Ergonomic Classroom Seating',
      description: 'Posture-friendly desks and chairs sized for every age group, built to stay comfortable through a full day of classes.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=85',
      categories: ['Classroom'],
    },
    {
      title: 'Modular Library Furniture',
      description: 'Reconfigurable shelving, reading tables and study pods that adapt as your collection and reader habits change.',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=85',
      categories: ['Library'],
    },
    {
      title: 'Hostel & Dormitory Furniture',
      description: 'Space-efficient beds, wardrobes and study units engineered for durability under daily student use.',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=85',
      categories: ['Hostel'],
    },
    {
      title: 'Laboratory Workbenches & Stools',
      description: 'Chemical-resistant, height-adjustable lab furniture built to keep up with hands-on science and research.',
      image: 'https://images.unsplash.com/photo-1532094349884-543290e34c7d?auto=format&fit=crop&w=900&q=85',
      categories: ['Lab'],
    },
    {
      title: 'Outdoor & Play Furniture',
      description: 'Weatherproof seating, play structures and courtyard furniture that hold up to sun, rain and daily footfall.',
      image: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?auto=format&fit=crop&w=900&q=85',
      categories: ['Outdoor'],
    },
    {
      title: 'Custom Furniture Design Services',
      description: 'In-house designers who work from your floor plan to spec furniture that fits the exact room, not the other way round.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
      categories: ['Custom'],
    },
  ] as FurnitureDesignCard[],
};
