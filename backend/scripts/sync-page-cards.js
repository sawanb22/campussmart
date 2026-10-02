const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const DEFAULTS = {
  'sports-infra': [
    { title: 'Basketball Court', description: 'FIBA-compliant wooden and acrylic cushioned surfaces engineered for shock absorption, bounce consistency, and heavy collegiate competition.', categories: ['Indoor', 'Adults'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Football Ground', description: 'FIFA-standard artificial turf and natural grass pitches with laser-leveled sub-base drainage and floodlighting systems.', categories: ['Outdoor', 'Adults'], image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Tennis Court', description: 'ITF-approved multi-layer synthetic acrylic surfaces offering true ball response, high-traction grip, and all-weather durability.', categories: ['Outdoor', 'Adults'], image: 'https://images.unsplash.com/photo-1622163642998-1ea36b1ade5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Swimming Pool', description: 'Semi-Olympic and recreational aquatic facilities with commercial sand filtration, anti-slip surrounds, and competitive lane markers.', categories: ['Indoor', 'Kids', 'Adults'], image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Athletics Track', description: 'IAAF-certified seamless polyurethane running tracks designed for maximum energy return, spike resistance, and athlete joint safety.', categories: ['Outdoor', 'Adults', 'Training'], image: 'https://images.unsplash.com/photo-1461896836934-voices?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Indoor Badminton Arena', description: 'BWF-standard shock-absorbing vinyl mats paired with anti-glare high-bay sports LED illumination and acoustic dampening.', categories: ['Indoor', 'Kids', 'Adults'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Kids Play Zone', description: 'Child-safe EPDM impact-attenuating rubber safety surfacing equipped with certified non-toxic climbing and balancing structures.', categories: ['Kids'], image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=400&q=80' },
    { title: 'Multi-Sport Training Area', description: 'Versatile multi-sport halls adapted for volleyball, handball, yoga, martial arts, and institutional fitness programming.', categories: ['Training', 'Adults'], image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80' },
  ],
  'tech-infra': [
    { title: 'Interactive Displays', description: '4K interactive flat panels with zero-lag optical bonding, multi-touch stylus support, and unified digital whiteboard suites.', categories: ['Classroom Tech'], image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Network Solutions', description: 'High-density 802.11ax Wi-Fi 6 APs and structured optical fiber backbones engineered for seamless campus connectivity.', categories: ['Networking'], image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Server Infrastructure', description: 'Hybrid on-premise blade servers and scalable academic cloud setups delivering low latency and enterprise uptime.', categories: ['Networking'], image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Cybersecurity', description: 'Next-generation firewalls, encrypted endpoint threat protection, and automated student data access control.', categories: ['Security'], image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ],
  'labs': [
    { title: 'Chemistry Lab', description: 'Purpose-built environments for practical chemistry education and safe experimentation.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Physics Lab', description: 'Hands-on spaces for experiments, measurement, and applied physics learning.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Math Lab', description: 'Interactive learning environments that make mathematical concepts practical and visual.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80' },
    { title: 'Biology Lab', description: 'Well-equipped spaces for life science observation, analysis, and discovery.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Composite Skill Lab', description: 'Flexible multidisciplinary labs that support practical and vocational skill development.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' },
    { title: 'AI/ML Lab', description: 'Future-ready computing environments for artificial intelligence and machine learning.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Computer Lab', description: 'Connected, ergonomic spaces for digital learning, coding, and collaboration.', categories: ['Tech Labs'], image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'AI Stations', description: 'Specialized workstations for immersive technology and intelligent systems learning.', categories: ['Tech Labs'], image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80' },
    { title: 'STEM Labs', description: 'Integrated innovation spaces that bring science, technology, engineering, and math together.', categories: ['Innovation Labs'], image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=400&q=80' },
  ],
  'libraries': [
    { title: 'Library Furniture', description: 'Complete furniture solutions for functional and welcoming library environments.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Reading Tables and Chairs', description: 'Comfortable, durable seating for focused individual and group reading.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80' },
    { title: 'Bookshelves and Racks', description: 'Organized storage systems that make every collection easy to access.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80' },
    { title: 'Open Book Shelves', description: 'Accessible open shelving designed for discovery and smooth circulation.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80' },
    { title: 'Heritage & Academic Stacks', description: 'Heavy-gauge steel and timber shelving designed for extensive reference collections, archives, and high-capacity storage.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80' },
    { title: 'Digital Research Commons', description: 'Tech-enabled computer pods, OPAC terminals, and individual study carrels with integrated acoustic and power hubs.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=400&q=80' },
    { title: 'Early Learning Reading Zones', description: 'Low-height accessible display bays, playful soft seating, and collaborative story circles to cultivate early reading habits.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' },
    { title: 'Modular Collaborative Commons', description: 'Reconfigurable breakout lounge tables, acoustic mobile screens, and flexible group discussion zones.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80' }
  ]
};

async function sync() {
  const uploadsDir = path.resolve(__dirname, '../uploads');

  for (const [slug, defaultCards] of Object.entries(DEFAULTS)) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page || !page.pageData) continue;

    let data;
    try {
      data = JSON.parse(page.pageData);
    } catch (e) {
      continue;
    }

    if (!Array.isArray(data.cards)) {
      data.cards = defaultCards;
    } else {
      // Check each card's image
      data.cards = data.cards.map((card, i) => {
        const defCard = defaultCards.find(d => d.title.toLowerCase() === (card.title || '').toLowerCase()) || defaultCards[i % defaultCards.length];
        let image = card.image || defCard.image;
        if (image.startsWith('/uploads/')) {
          const relPath = image.replace(/^\/uploads\//, '');
          const absPath = path.join(uploadsDir, relPath);
          if (!fs.existsSync(absPath)) {
            // Missing file! Fallback to default
            image = defCard.image;
          }
        }
        return {
          ...card,
          image,
          description: card.description && card.description !== 'Premium sports facility designed for training, events, and wellness.'
            ? card.description
            : defCard.description
        };
      });
    }

    await prisma.page.update({
      where: { slug },
      data: { pageData: JSON.stringify(data) }
    });
    console.log(`Synced pageData for ${slug} successfully.`);
  }
}

sync()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
