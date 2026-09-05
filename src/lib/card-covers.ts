export interface CardCover {
  background: string;
  accent: string;
}

// A rotating set of illustrated gradient "covers" used as a placeholder behind
// real thumbnails (or as the visual itself when a card has no image), echoing
// the colourful blob-style article covers of the blog/catalogue design.
export const CARD_COVERS: CardCover[] = [
  {
    background:
      'radial-gradient(circle at 72% 28%, #ffd9ac 0 16%, transparent 17%), linear-gradient(155deg, #4a5a61 0 22%, #93a2a3 23% 32%, #33474b 33% 58%, #cdb894 59% 100%)',
    accent: '#fd744f',
  },
  {
    background:
      'radial-gradient(circle at 26% 23%, #f6a58f 0 22%, transparent 23%), radial-gradient(circle at 79% 20%, #7fd9b4 0 23%, transparent 24%), linear-gradient(150deg, #8b989d, #4a545a 45%, #977f5f 100%)',
    accent: '#ff6e5c',
  },
  {
    background:
      'radial-gradient(circle at 82% 86%, #9c73ec 0 18%, transparent 19%), linear-gradient(120deg, #45606a, #74909291 52%, #c1cec2 100%)',
    accent: '#45c9a0',
  },
  {
    background:
      'radial-gradient(circle at 20% 68%, #ffc079 0 12%, transparent 13%), linear-gradient(140deg, #c08e5f 0 30%, #4f8998 31% 63%, #c6e0dd 100%)',
    accent: '#ff735b',
  },
  {
    background:
      'radial-gradient(circle at 27% 26%, #ff8a7a 0 18%, transparent 19%), linear-gradient(120deg, #cca873, #cdd6d0 52%, #647d81 100%)',
    accent: '#ffd34a',
  },
  {
    background: 'linear-gradient(130deg, #dde5e5 0 30%, #79969c 31% 52%, #edc6ab 53% 100%)',
    accent: '#7658e7',
  },
];

export function getCardCover(index: number): CardCover {
  return CARD_COVERS[index % CARD_COVERS.length];
}

// A warmer ink-and-ember palette (dark charcoal base with orange glows) for
// pages that want a moodier, construction/process feel instead of the
// cooler multi-colour blog palette above.
export const WARM_CARD_COVERS: CardCover[] = [
  {
    background:
      'radial-gradient(circle at 20% 85%, #ff8b00 0 15%, transparent 16%), radial-gradient(circle at 85% 10%, #4b1608 0 22%, transparent 23%), linear-gradient(145deg, #140c09 0%, #241209 45%, #e2650a 46% 52%, #1c0f09 100%)',
    accent: '#ff8b00',
  },
  {
    background:
      'radial-gradient(circle at 25% 35%, #ff8b1f 0 10%, transparent 11%), radial-gradient(circle at 72% 68%, #ffab52 0 13%, transparent 14%), linear-gradient(130deg, #3d160a, #b85420 48%, #2c1109 100%)',
    accent: '#ff7a1a',
  },
  {
    background: 'repeating-linear-gradient(155deg, #1c0f09 0 10px, #2a140b 11px 18px), radial-gradient(circle at 85% 15%, #d9660e 0 20%, transparent 21%)',
    accent: '#f08b1c',
  },
  {
    background: 'linear-gradient(140deg, #14100e 0 40%, #e56a00 41% 50%, #1c130f 51% 100%)',
    accent: '#e56a00',
  },
  {
    background:
      'radial-gradient(circle at 22% 70%, #e07a13 0 13%, transparent 14%), radial-gradient(circle at 68% 32%, #a3460e 0 18%, transparent 19%), linear-gradient(135deg, #180f0c, #6d2a0f 100%)',
    accent: '#e07a13',
  },
  {
    background:
      'radial-gradient(ellipse at 50% 112%, #f2901c 0 22%, transparent 23%), radial-gradient(ellipse at 12% 8%, #9a3c10 0 20%, transparent 21%), linear-gradient(135deg, #150f0d, #6b350f 100%)',
    accent: '#f2901c',
  },
];

export function getWarmCardCover(index: number): CardCover {
  return WARM_CARD_COVERS[index % WARM_CARD_COVERS.length];
}
