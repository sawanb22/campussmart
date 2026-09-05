export interface ArVrCard {
  title: string;
  description?: string;
  image?: string;
  href?: string;
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

export const AR_VR_DEFAULTS = {
  heroTitle: 'AR / VR Learning',
  heroSubtitle:
    'Immersive reality experiences that bring complex concepts to vivid, unforgettable life — from anatomy walkthroughs to virtual field trips your students will actually remember.',
  heroImage: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=900&q=85',
  section2Title: 'AR / VR Experiences',
  cards: [
    {
      title: 'VR Science Labs',
      description: 'Run chemistry and physics experiments virtually — no breakage, no safety risk, unlimited repeats.',
      image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=700&q=85',
    },
    {
      title: 'AR Anatomy & Biology',
      description: 'Walk through a beating heart or a living cell at full scale, layer by layer, on a tablet or headset.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=85',
    },
    {
      title: 'Virtual Field Trips',
      description: 'Visit the pyramids, the ISS or the ocean floor without leaving the classroom, in fully guided sessions.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=700&q=85',
    },
    {
      title: 'Historical & Cultural Simulations',
      description: 'Step into recreated historical events and sites for a kind of recall no textbook page can match.',
      image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=700&q=85',
    },
    {
      title: 'Engineering & Design Visualization',
      description: 'Rotate, section and stress-test 3D models of real engineering projects before a single part is built.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=85',
    },
    {
      title: 'Language Immersion Experiences',
      description: 'Practise conversations in simulated real-world settings that make new languages stick faster.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=85',
    },
  ] as ArVrCard[],
  ctaTitle: 'Ready to Bring AR / VR to Your Classrooms?',
  ctaSubtitle: 'Tell us about your subjects and student count — our team will recommend the right starting setup.',
};
