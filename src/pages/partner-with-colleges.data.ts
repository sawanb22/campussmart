export const PARTNER_PAGE_SLUG = 'partner-with-colleges';

export function slugifyModelTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'partnership-model';
}

export const PARTNER_DEFAULTS = {
  heroTitle: 'Partner With Running Colleges',
  heroSubtitle:
    "Join India's fastest-growing network of educational partnerships. Bring proven campus infrastructure, technology and management expertise to your institution — and grow together with CampusMart.",
  heroImage:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  section2Title: 'Partnership Models',
  cards: [
    {
      title: 'Managed Campus Partnership',
      description: 'We take on day-to-day academic and campus operations while you retain ownership, backed by our proven management playbook.',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '',
    },
    {
      title: 'Franchise & Brand Licensing',
      description: 'License curriculum, branding and quality standards to launch a recognised institution with a fast-track playbook.',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80',
      href: '',
    },
    {
      title: 'Equity & Investment Partnership',
      description: 'Access growth capital and strategic investment to expand facilities, technology and academic programmes.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '',
    },
    {
      title: 'Infrastructure Development',
      description: 'Turnkey campus design, construction and furnishing delivered by our in-house architects and execution teams.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '',
    },
    {
      title: 'Curriculum & Academic Collaboration',
      description: 'Co-develop NEP-aligned curriculum, assessment systems and digital learning tools with our academic partners.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '',
    },
    {
      title: 'Faculty Exchange & Training',
      description: 'Upskill faculty through structured training programmes, workshops and cross-campus exchange initiatives.',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '',
    },
  ],
  ctaTitle: 'Ready to Explore a Partnership?',
  ctaSubtitle: "Tell us about your institution and our partnerships team will get in touch within 2 business days.",
};
