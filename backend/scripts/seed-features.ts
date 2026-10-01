import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultFeatures = [
    { title: 'Digital Transformation', description: 'Cutting-edge digital infrastructure transforming how modern campuses operate and learn.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=90', href: '/digital-transformation', tag: 'Digital', color: '#3B82F6', h: 340 },
    { title: 'AI-Powered Learning Stations', description: 'Intelligent AI stations personalising education for every student at every level.', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=90', href: '/ai-stations', tag: 'AI & Tech', color: '#8B5CF6', h: 220 },
    { title: 'Innovation Centres', description: 'Purpose-built spaces designed to unlock creativity, collaboration and breakthrough thinking.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=90', href: '/innovation-centres', tag: 'Innovation', color: '#EC4899', h: 270 },
    { title: 'Smart Classrooms', description: 'IoT-connected rooms with interactive boards, real-time analytics and immersive tools.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=90', href: '/tech-infra', tag: 'Tech Infra', color: '#06B6D4', h: 220 },
    { title: 'Campus Furniture Design', description: 'Thoughtfully engineered, ergonomic furniture that elevates the academic experience.', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=90', href: '/furniture', tag: 'Furniture', color: '#F59E0B', h: 360 },
    { title: 'Sports Infrastructure', description: 'World-class athletic facilities nurturing champions, wellness, and team spirit.', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=90', href: '/sports-infra', tag: 'Sports', color: '#10B981', h: 240 },
    { title: 'Library Management', description: 'AI-driven smart library solutions providing seamless access to global knowledge.', image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=90', href: '/library-management', tag: 'Library', color: '#6366F1', h: 300 },
    { title: 'Science & Tech Labs', description: 'Fully equipped STEM laboratories built for discovery, experimentation and innovation.', image: 'https://images.unsplash.com/photo-1532094349884-543290e34c7d?auto=format&fit=crop&w=800&q=90', href: '/labs', tag: 'Labs', color: '#14B8A6', h: 200 },
    { title: 'Campus Master Planning', description: 'Visionary campus planning from concept to construction, built to inspire generations.', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=90', href: '/campus-design', tag: 'Planning', color: '#F97316', h: 320 },
    { title: 'AR / VR Learning', description: 'Immersive reality experiences bringing complex concepts to vivid, unforgettable life.', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=90', href: '/digital-transformation', tag: 'AR / VR', color: '#A855F7', h: 240 },
    { title: 'Campus Automation', description: 'Smart systems automating admissions, attendance, finance and governance seamlessly.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', href: '/campus-automation', tag: 'Automation', color: '#0EA5E9', h: 200 },
    { title: 'Collaboration Spaces', description: 'Dynamic, flexible zones engineered for productive teamwork and creative ideation.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', href: '/collaboration', tag: 'Spaces', color: '#EF4444', h: 260 },
];

async function main() {
  console.log('Restoring classic home features...');
  await prisma.siteContent.upsert({
    where: { key: 'home_features' },
    update: { value: JSON.stringify(defaultFeatures) },
    create: { key: 'home_features', value: JSON.stringify(defaultFeatures) },
  });
  console.log('Successfully restored 11 classic feature cards.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
