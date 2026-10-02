const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const SYNC_PAGES = {
  labs: {
    heroTitle: 'Laboratory Solutions',
    heroSubtitle: 'State-of-the-art laboratory setups for schools and colleges. From STEM labs to specialized research facilities, we deliver excellence.',
    heroImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    section1Title: 'Specialized Laboratory Environments',
    cards: [
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
  },
  libraries: {
    heroTitle: 'Library Solutions',
    heroSubtitle: 'Modern library solutions that blend traditional resources with digital innovation. Create spaces that inspire learning and research.',
    heroImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    section1Title: 'Curated Library Environments',
    cards: [
      { title: 'Library Furniture', description: 'Complete furniture solutions for functional and welcoming library environments.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Reading Tables and Chairs', description: 'Comfortable, durable seating for focused individual and group reading.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80' },
      { title: 'Bookshelves and Racks', description: 'Organized storage systems that make every collection easy to access.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80' },
      { title: 'Open Book Shelves', description: 'Accessible open shelving designed for discovery and smooth circulation.', categories: ['Library Furniture'], image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80' },
      { title: 'Heritage & Academic Stacks', description: 'Heavy-gauge steel and timber shelving designed for extensive reference collections, archives, and high-capacity storage.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80' },
      { title: 'Digital Research Commons', description: 'Tech-enabled computer pods, OPAC terminals, and individual study carrels with integrated acoustic and power hubs.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=400&q=80' },
      { title: 'Early Learning Reading Zones', description: 'Low-height accessible display bays, playful soft seating, and collaborative story circles to cultivate early reading habits.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' },
      { title: 'Modular Collaborative Commons', description: 'Reconfigurable breakout lounge tables, acoustic mobile screens, and flexible group discussion zones.', categories: ['Libraries'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80' },
    ],
  },
  'tech-infra': {
    heroTitle: 'Technology Infrastructure',
    heroSubtitle: 'Complete technology infrastructure solutions for modern campuses. From networking to security, we build the foundation for digital learning.',
    heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    section1Title: 'Campus Technology Solutions',
    cards: [
      { title: 'Interactive Displays', description: '4K interactive flat panels with zero-lag optical bonding, multi-touch stylus support, and unified digital whiteboard suites.', categories: ['Classroom Tech'], image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Network Solutions', description: 'High-density 802.11ax Wi-Fi 6 APs and structured optical fiber backbones engineered for seamless campus connectivity.', categories: ['Networking'], image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Server Infrastructure', description: 'Hybrid on-premise blade servers and scalable academic cloud setups delivering low latency and enterprise uptime.', categories: ['Networking'], image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Cybersecurity', description: 'Next-generation firewalls, encrypted endpoint threat protection, and automated student data access control.', categories: ['Security'], image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    ],
  },
  'sports-infra': {
    heroTitle: 'Sports Infrastructure',
    heroSubtitle: 'World-class sports facilities designed to promote physical fitness and athletic excellence in educational institutions.',
    heroImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    section1Title: 'Sports Facilities',
    section2Title: 'Our Services Include',
    section2Description: 'From concept to completion, we deliver turnkey solutions for elite athletic performance.',
    ctaTitle: 'Ready to Build Your Arena?',
    ctaButtonLabel: 'Get Project Audit',
    ctaHref: '/contact-us',
    cards: [
      { title: 'Basketball Court', description: 'FIBA-compliant wooden and acrylic cushioned surfaces engineered for shock absorption, bounce consistency, and heavy collegiate competition.', categories: ['Indoor', 'Adults'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Football Ground', description: 'FIFA-standard artificial turf and natural grass pitches with laser-leveled sub-base drainage and floodlighting systems.', categories: ['Outdoor', 'Adults'], image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Tennis Court', description: 'ITF-approved multi-layer synthetic acrylic surfaces offering true ball response, high-traction grip, and all-weather durability.', categories: ['Outdoor', 'Adults'], image: 'https://images.unsplash.com/photo-1622163642998-1ea36b1ade5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Swimming Pool', description: 'Semi-Olympic and recreational aquatic facilities with commercial sand filtration, anti-slip surrounds, and competitive lane markers.', categories: ['Indoor', 'Kids', 'Adults'], image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Athletics Track', description: 'IAAF-certified seamless polyurethane running tracks designed for maximum energy return, spike resistance, and athlete joint safety.', categories: ['Outdoor', 'Adults', 'Training'], image: 'https://images.unsplash.com/photo-1461896836934-voices?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Indoor Badminton Arena', description: 'BWF-standard shock-absorbing vinyl mats paired with anti-glare high-bay sports LED illumination and acoustic dampening.', categories: ['Indoor', 'Kids', 'Adults'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { title: 'Kids Play Zone', description: 'Child-safe EPDM impact-attenuating rubber safety surfacing equipped with certified non-toxic climbing and balancing structures.', categories: ['Kids'], image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=400&q=80' },
      { title: 'Multi-Sport Training Area', description: 'Versatile multi-sport halls adapted for volleyball, handball, yoga, martial arts, and institutional fitness programming.', categories: ['Training', 'Adults'], image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80' },
    ],
    features: [
      'Surface Installation',
      'Equipment Supply',
      'Facility Planning',
      'Safety Compliance',
      'Maintenance Support',
      'Turnkey Projects',
    ],
  },
  'ai-ml': {
    heroTitle: 'AI & Machine Learning, made classroom-ready',
    heroSubtitle: 'Learning stations, ML labs and computing infrastructure that give students hands-on experience with real AI tools, not just slides about them.',
    heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=85',
    section1Title: 'AI/ML Solutions',
    cards: [
      { title: 'AI Learning Stations', description: 'Interactive, sensor-equipped stations where students run and tweak real AI models instead of just reading about them.', categories: ['Learning Stations'], image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'ML Labs', description: 'Dedicated lab benches for model training, data pipelines and experimentation, sized for a full class at once.', categories: ['Learning Stations'], image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Coding Platforms', description: 'Cloud-ready development environments pre-loaded with the frameworks students need for AI and software projects.', categories: ['Software Platforms'], image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Computing Infrastructure', description: 'GPU-backed compute and campus networking sized to keep training jobs and simulations running smoothly.', categories: ['Infrastructure'], image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'AI Curriculum & Certification', description: 'NEP-aligned course modules and assessments that give AI/ML learning a clear, credentialed structure.', categories: ['Curriculum'], image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Faculty AI Training', description: 'Hands-on workshops that get faculty comfortable teaching and mentoring AI/ML projects, not just supervising them.', categories: ['Curriculum'], image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
    ],
  },
  collaboration: {
    heroTitle: 'Spaces built for working together',
    heroSubtitle: 'Flexible rooms, pods and studios that turn group work, discussion and presentation into a normal part of campus life.',
    section1Title: 'Collaboration Spaces',
    cards: [
      { title: 'Collaborative Learning Pods', description: 'Flexible, movable seating for project teams to gather, sketch out ideas and work side by side.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80' },
      { title: 'Discussion & Seminar Rooms', description: 'Acoustically treated rooms for tutorials, viva sessions and small-group discussion away from the noise.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80' },
      { title: 'Video Conferencing Suites', description: 'Camera, mic and display setups that make hybrid classes and remote guest sessions feel effortless.', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=80' },
      { title: 'Presentation & Pitch Studios', description: 'A dedicated stage for practice talks, project demos and jury presentations, built and lit properly.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80' },
      { title: 'Maker & Innovation Corners', description: 'Hands-on benches where student teams can prototype, tinker and test ideas together.', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80' },
      { title: 'Faculty Collaboration Lounges', description: 'A calmer space for staff to plan curriculum, mentor students and work between classes.', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=700&q=80' },
    ],
  },
  innovation: {
    heroTitle: 'Innovation & Startup Programme',
    heroSubtitle: 'A managed platform that takes student ideas from first sketch to a funded, market-ready startup — run on your campus.',
    section1Title: 'Innovation Solutions',
    cards: [
      { title: 'Ideation & Research', description: 'Structured workshops and mentor office hours that turn early, half-formed ideas into validated problem statements worth building.', categories: ['Ideation'], image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Incubation Support', description: 'Dedicated desk space, seed funding pathways and technical mentors to help student teams build their first working prototype.', categories: ['Incubation'], image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Acceleration Programme', description: 'A time-boxed sprint with industry mentors and investor exposure to push validated teams toward their first paying customers.', categories: ['Acceleration'], image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Market Access & Funding', description: 'Investor connect days, grant application support and distribution partnerships that get real products in front of real customers.', categories: ['Funding'], image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Managed Innovation Hubs', description: 'A fully equipped, staffed innovation centre on your own campus — we handle setup, tooling and day-to-day operations.', categories: ['Ecosystem'], image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Venture Studio Launchpad', description: 'A structured path from validated prototype to registered company, with legal, financial and go-to-market support built in.', categories: ['Ecosystem'], image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
      { title: 'Global Chapters Network', description: 'Connect student founders with partner campuses and alumni founders across our national innovation network.', categories: ['Ecosystem'], image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85' },
    ],
    ctaTitle: 'Ready to talk?',
    ctaSubtitle: 'Connect with our programme managers for a walkthrough of what a managed innovation centre looks like on your campus.',
  },
  'campus-design': {
    heroTitle: 'Campus Design',
    heroSubtitle: 'Transform your educational vision into reality with our comprehensive campus design services. We create spaces that inspire learning and foster innovation.',
    heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    section1Title: 'Our Design Services',
    ctaTitle: 'Ready to Design Your Dream Campus?',
    ctaSubtitle: 'Let our expert team help you create a campus that inspires and empowers.',
    cards: [
      { title: 'Master Planning', description: 'Comprehensive campus master planning for new and existing institutions.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
      { title: 'Architectural Design', description: 'Innovative architectural solutions for educational buildings.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
      { title: 'Interior Design', description: 'Functional and aesthetic interior spaces for learning.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
      { title: 'Landscape Design', description: 'Outdoor spaces that enhance the campus environment.', image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    ],
  },
  furniture: {
    heroTitle: 'Furniture Solutions',
    heroSubtitle: 'Premium quality furniture designed for educational institutions. From classrooms to libraries, we provide durable and ergonomic solutions.',
    heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    section1Title: 'Furniture Categories',
  },
};

async function main() {
  console.log('Synchronizing database category pages with component defaults...');

  for (const [slug, data] of Object.entries(SYNC_PAGES)) {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (!existing) {
      console.log(`[CREATING] ${slug}`);
      await prisma.page.create({
        data: {
          slug,
          title: data.heroTitle || slug,
          published: true,
          pageData: JSON.stringify(data),
        },
      });
    } else {
      console.log(`[UPDATING] ${slug}`);
      // Merge: preserve any existing fields, but ensure titles, subtitles, and clean cards match
      let merged = {};
      try {
        merged = JSON.parse(existing.pageData || '{}');
      } catch (e) {
        merged = {};
      }
      merged = {
        ...merged,
        ...data,
      };

      await prisma.page.update({
        where: { slug },
        data: {
          title: data.heroTitle || existing.title,
          pageData: JSON.stringify(merged),
        },
      });
    }
  }

  console.log('Synchronization complete!');
}

main().finally(() => prisma.$disconnect());
