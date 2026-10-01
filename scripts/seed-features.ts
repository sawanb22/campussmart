import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultFeatures = [
  { 
    title: 'Digital Transformation', 
    description: 'Complete overhaul of traditional classrooms into smart, hybrid learning centers.', 
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=90', 
    href: '/digital-transformation', 
    badge: 'POPULAR', 
    badgeColor: 'bg-blue-500/40',
    color: '#3B82F6',
    h: 360
  },
  { 
    title: 'Furniture Revamp', 
    description: 'Ergonomic, flexible furniture for the modern student.', 
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=90', 
    href: '/furniture', 
    badge: 'ESSENTIAL', 
    badgeColor: 'bg-amber-500/40',
    color: '#F59E0B',
    h: 240
  },
  { 
    title: 'Auditorium Acoustics', 
    description: 'World class sound systems and acoustic treatments.', 
    image: 'https://images.unsplash.com/photo-1503095396549-8070390182ae?auto=format&fit=crop&w=800&q=80', 
    href: '/tech-infra', 
    badge: 'PREMIUM', 
    badgeColor: 'bg-purple-500/40',
    color: '#8B5CF6',
    h: 280
  },
  { title: 'Smart Classrooms', description: 'IoT-connected rooms with interactive boards, real-time analytics and immersive tools.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=90', href: '/tech-infra', tag: 'Tech Infra', color: '#06B6D4', h: 220 },
  { title: 'Sports Infrastructure', description: 'World-class athletic facilities nurturing champions, wellness, and team spirit.', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=90', href: '/sports-infra', tag: 'Sports', color: '#10B981', h: 320 },
  { title: 'Library Management', description: 'AI-driven smart library solutions providing seamless access to global knowledge.', image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=90', href: '/library-management', tag: 'Library', color: '#6366F1', h: 260 },
  { title: 'Science & Tech Labs', description: 'Fully equipped STEM laboratories built for discovery, experimentation and innovation.', image: 'https://images.unsplash.com/photo-1532094349884-543290e34c7d?auto=format&fit=crop&w=800&q=80', href: '/labs', tag: 'Labs', color: '#14B8A6', h: 200 },
  { title: 'Campus Master Planning', description: 'Visionary campus planning from concept to construction, built to inspire generations.', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80', href: '/campus-design', tag: 'Planning', color: '#F97316', h: 340 },
  { title: 'AR / VR Learning', description: 'Immersive reality experiences bringing complex concepts to vivid, unforgettable life.', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=90', href: '/digital-transformation', tag: 'AR / VR', color: '#A855F7', h: 240 },
  { title: 'Campus Automation', description: 'Smart systems automating admissions, attendance, finance and governance seamlessly.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', href: '/campus-automation', tag: 'Automation', color: '#0EA5E9', h: 220 },
  { title: 'Collaboration Spaces', description: 'Dynamic, flexible zones engineered for productive teamwork and creative ideation.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', href: '/collaboration', tag: 'Spaces', color: '#EF4444', h: 280 },
];

async function main() {
  console.log('Seeding home features...');
  await prisma.siteContent.upsert({
    where: { key: 'home_features' },
    update: { value: JSON.stringify(defaultFeatures) },
    create: { key: 'home_features', value: JSON.stringify(defaultFeatures) },
  });
  console.log('Successfully seeded 11 home features.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
