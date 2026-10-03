export interface LibraryManagementCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
  slug?: string;
}

export const LIBRARY_MGMT_PAGE_SLUG = 'library-management';

export function slugifyLibraryModuleTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'module'
  );
}

export const LIBRARY_MGMT_DEFAULTS = {
  heroTitle: 'Your library, run the modern way',
  heroSubtitle:
    'AI-assisted cataloguing, digital access and self-service tools that free your library staff to spend less time on paperwork and more time helping students.',
  heroImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=85',
  cards: [
    {
      title: 'Digital Cataloguing',
      description: 'Barcode and RFID-based cataloguing that keeps your entire collection searchable and accurate in real time.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85',
      categories: ['Catalogue'],
    },
    {
      title: 'E-Journal & Database Access',
      description: 'Single sign-on access to journals, e-books and research databases from anywhere on or off campus.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=85',
      categories: ['Digital Access'],
    },
    {
      title: 'Circulation & User Management',
      description: 'Track issues, returns, renewals and fines automatically, with a clear history for every member.',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=85',
      categories: ['Operations'],
    },
    {
      title: 'RFID Self-Checkout',
      description: 'Let students issue and return books themselves at a self-service kiosk, cutting queues at the counter.',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
      categories: ['Automation'],
    },
    {
      title: 'Usage Analytics & Reports',
      description: 'See which titles, sections and hours get used most, so your next acquisition budget goes further.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85',
      categories: ['Insights'],
    },
    {
      title: 'Automated Reminders',
      description: 'SMS and email reminders for due dates and reservations, sent automatically so nothing slips through.',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=85',
      categories: ['Automation'],
    },
  ] as LibraryManagementCard[],
};
