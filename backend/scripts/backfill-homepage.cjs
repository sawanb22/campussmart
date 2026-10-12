const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_RESOURCES = [
  {
    title: 'Complete Guide on AI Implementation',
    description: 'A comprehensive guide for implementing AI in educational institutions.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    color: '#0ea5e9',
    tag: 'GUIDE',
    href: '/ai-guide',
  },
  {
    title: 'Setting Up a College in India',
    description: 'Step-by-step masterclass to establishing a new college in India.',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800',
    color: '#f59e0b',
    tag: 'HANDBOOK',
    href: '/setup-college',
  },
  {
    title: 'UGC Guidelines for Digital Campus',
    description: 'Latest UGC guidelines for the digital transformation of campuses.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    color: '#10b981',
    tag: 'COMPLIANCE',
    href: '/ugc-guidelines',
  },
  {
    title: 'Product Catalog 25-26',
    description: 'Explore our complete range of furniture, tech, and sports infrastructure.',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800',
    color: '#ef4444',
    tag: 'CATALOGUE',
    href: '/catalogues',
  },
  {
    title: 'Lookbook – Play Furniture',
    description: 'Inspiring play area solutions and ergonomic designs for younger students.',
    image: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?auto=format&fit=crop&q=80&w=800',
    color: '#8b5cf6',
    tag: 'PORTFOLIO',
    href: '/furniture',
  },
  {
    title: '20 Stunning College Buildings',
    description: 'A curated collection of the most breathtaking campus architecture.',
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800',
    color: '#ec4899',
    tag: 'SHOWCASE',
    href: '/20-stunning-college-buildings',
  }
];

const DEFAULT_PARTNERSHIP = {
  formTitle: 'Partnership Enquiry Form',
  formSubtitle: "Please fill out the form and we'll get back to you as soon as possible.",
  readyTitle: 'Ready to talk?',
  readyText: 'At Campus Mart, we have the expertise in guiding you to set up your new campus project and help you maximize the performance of your campus while also figuring out your return on investment. We have the expertise in guiding you to set up your new campus project and help you maximize.',
  whatsappNumber: '919966109191',
  whatsappText: 'Connect On WhatsApp',
  phoneNumber: '+919966109191',
  phoneText: 'Call Us 9966109191',
};

const DEFAULT_STYLES = {
  headingFont: 'poppins',
  bodyFont: 'opensans',
  primaryColor: '#002B66',
  heroBg: 'blue',
  heroLayout: 'split-right',
  hideCategories: false,
  hideTicker: false,
  hideSearchBar: false,
  hideHero: false,
  hideServices: false,
  hideFeatures: false,
  hideResources: false,
  hidePartnershipForm: false,
  hideCollaborations: false,
};

async function main() {
  console.log('--- Ensuring Page row for "home" ---');
  const existingPage = await prisma.page.findUnique({ where: { slug: 'home' } });
  if (!existingPage) {
    const created = await prisma.page.create({
      data: {
        title: 'Homepage',
        slug: 'home',
        template: 'home',
        published: true,
        pageData: JSON.stringify(DEFAULT_STYLES),
      },
    });
    console.log('✅ Created Page row for "home":', created.id);
  } else {
    console.log('ℹ️ Page row for "home" already exists (id:', existingPage.id, ')');
  }

  console.log('\n--- Ensuring default SiteContent entries ---');
  const defaults = [
    { key: 'home_styles', value: JSON.stringify(DEFAULT_STYLES) },
    { key: 'home_resources', value: JSON.stringify({ heading: 'Resources & Catalogues', subtitle: 'Explore our curated guides, product showrooms, and official frameworks to inspire your next campus project.', items: DEFAULT_RESOURCES }) },
    { key: 'home_partnership', value: JSON.stringify(DEFAULT_PARTNERSHIP) },
    { key: 'ticker_title', value: 'LATEST UPDATES' },
    { key: 'home_search_placeholder', value: 'Search: I need a design for an AI STATION' },
    { key: 'collaborations_title', value: 'Trusted By Leading Institutions Worldwide' },
  ];

  for (const item of defaults) {
    const existing = await prisma.siteContent.findUnique({ where: { key: item.key } });
    if (!existing) {
      await prisma.siteContent.create({ data: item });
      console.log('✅ Created SiteContent:', item.key);
    } else {
      console.log('ℹ️ SiteContent exists:', item.key);
    }
  }

  console.log('\n✅ Homepage backfill complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
