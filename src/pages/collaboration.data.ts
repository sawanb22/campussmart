export interface CollaborationCard {
  title: string;
  description?: string;
  image?: string;
}

export const COLLAB_PAGE_SLUG = 'collaboration';

export function slugifyCollabTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space'
  );
}

export const COLLAB_DEFAULTS = {
  heroTitle: 'Spaces built for working together',
  heroSubtitle:
    'Flexible rooms, pods and studios that turn group work, discussion and presentation into a normal part of campus life.',
  cards: [
    {
      title: 'Collaborative Learning Pods',
      description: 'Flexible, movable seating for project teams to gather, sketch out ideas and work side by side.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Discussion & Seminar Rooms',
      description: 'Acoustically treated rooms for tutorials, viva sessions and small-group discussion away from the noise.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Video Conferencing Suites',
      description: 'Camera, mic and display setups that make hybrid classes and remote guest sessions feel effortless.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Presentation & Pitch Studios',
      description: 'A dedicated stage for practice talks, project demos and jury presentations, built and lit properly.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Maker & Innovation Corners',
      description: 'Hands-on benches where student teams can prototype, tinker and test ideas together.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
    },
    {
      title: 'Faculty Collaboration Lounges',
      description: 'A calmer space for staff to plan curriculum, mentor students and work between classes.',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=700&q=80',
    },
  ] as CollaborationCard[],
};
