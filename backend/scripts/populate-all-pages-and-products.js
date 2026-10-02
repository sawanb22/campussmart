const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const uploadsDir = path.resolve(__dirname, '../uploads');

// Curated high-res Unsplash image catalog for educational categories
const IMAGES = {
  // Classrooms & Furniture
  desk: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
  chair: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=600&q=80',
  table: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
  bookshelf: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80',
  storage: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
  furnitureGeneral: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  
  // Labs
  chemistry: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
  physics: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
  biology: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=600&q=80',
  labGeneral: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  microscope: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
  robotics: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
  
  // Tech & Innovation
  techGeneral: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
  smartClass: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
  display: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
  server: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  network: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  webcam: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
  
  // Sports
  sportsGeneral: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
  court: 'https://images.unsplash.com/photo-1518605368461-1e12613dca60?auto=format&fit=crop&w=600&q=80',
  mat: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  waterBottle: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80',
  
  // Library & Reading
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80',
  notebook: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  pen: 'https://images.unsplash.com/photo-1585336261026-7f416d863f64?auto=format&fit=crop&w=600&q=80',
  
  // Campus & Architecture
  campus: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
  architecture: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
};

function pickProductImage(name = '') {
  const n = name.toLowerCase();
  if (n.includes('chair') || n.includes('stools') || n.includes('seating')) return IMAGES.chair;
  if (n.includes('desk') || n.includes('table')) {
    if (n.includes('chem')) return IMAGES.chemistry;
    if (n.includes('bio')) return IMAGES.biology;
    if (n.includes('physic')) return IMAGES.physics;
    return IMAGES.desk;
  }
  if (n.includes('shelv') || n.includes('book') || n.includes('rack')) return IMAGES.bookshelf;
  if (n.includes('cabinet') || n.includes('locker') || n.includes('storage')) return IMAGES.storage;
  if (n.includes('microscope') || n.includes('apparatus') || n.includes('lab')) return IMAGES.microscope;
  if (n.includes('headphone')) return IMAGES.headphones;
  if (n.includes('keyboard')) return IMAGES.keyboard;
  if (n.includes('webcam')) return IMAGES.webcam;
  if (n.includes('laptop')) return IMAGES.laptop;
  if (n.includes('tablet') || n.includes('ipad') || n.includes('phone')) return IMAGES.tablet;
  if (n.includes('panel') || n.includes('display') || n.includes('screen') || n.includes('whiteboard')) return IMAGES.display;
  if (n.includes('net') || n.includes('vollyball') || n.includes('volleyball')) return IMAGES.volleyball;
  if (n.includes('mat') || n.includes('yoga')) return IMAGES.mat;
  if (n.includes('shoe') || n.includes('running')) return IMAGES.shoes;
  if (n.includes('bottle')) return IMAGES.waterBottle;
  if (n.includes('notebook')) return IMAGES.notebook;
  if (n.includes('pen')) return IMAGES.pen;
  if (n.includes('sport')) return IMAGES.sportsGeneral;
  return IMAGES.furnitureGeneral;
}

// Full page default definitions for secondary & CMS pages
const PAGE_TEMPLATES = {
  'smart-classrooms': {
    heroTitle: 'Smart Classrooms',
    heroSubtitle: 'Connected, interactive learning environments designed to increase student engagement and pedagogical efficacy.',
    heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Smart Classroom Solutions',
    features: ['IoT-Enabled Workspaces', 'Interactive 4K Panels', 'Automated Recording', 'Flexible Modular Seating', 'NEP 2020 Aligned'],
    cards: [
      { title: 'Interactive Flat Panels', description: 'Ultra HD 4K displays with multi-touch annotation, wireless casting, and anti-glare toughened glass.', categories: ['Hardware'], image: IMAGES.display },
      { title: 'Lecture Capture System', description: 'Auto-tracking AI cameras and studio-grade beamforming microphone arrays for hybrid learning.', categories: ['Audio/Visual'], image: IMAGES.smartClass },
      { title: 'Collaborative Desks', description: 'Reconfigurable modular pods that enable rapid transitions from lecture mode to team workshops.', categories: ['Furniture'], image: IMAGES.desk },
      { title: 'Centralized Control', description: 'One-touch digital podiums that manage lighting, projection, audio, and climate seamlessly.', categories: ['Automation'], image: IMAGES.techGeneral }
    ]
  },
  'digital-transformation': {
    heroTitle: 'Campus Digital Transformation',
    heroSubtitle: 'End-to-end modernization of academic operations, student information management, and institutional governance.',
    heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Transformation Pillars',
    features: ['Cloud ERP Integration', 'Smart Attendance Systems', 'Paperless Admissions', 'Automated Fee Gateways', 'Real-Time Executive Dashboards'],
    cards: [
      { title: 'Academic Management (LMS)', description: 'Unified learning management hosting curriculum repositories, automated grading, and live interactive assignments.', categories: ['Software'], image: IMAGES.display },
      { title: 'Campus Automation Hub', description: 'RFID and biometric access control integrated directly with parent communication portals and attendance logs.', categories: ['Operations'], image: IMAGES.network },
      { title: 'Institutional Analytics', description: 'Live BI executive dashboards giving administrators immediate visibility into retention, performance, and facilities.', categories: ['Data'], image: IMAGES.server },
      { title: 'Cybersecurity Infrastructure', description: 'Next-generation campus firewalls, encrypted cloud backups, and student data protection protocols.', categories: ['Security'], image: IMAGES.techGeneral }
    ]
  },
  'campus-automation': {
    heroTitle: 'Campus Automation Systems',
    heroSubtitle: 'Eliminate repetitive manual administration with intelligent campus workflow orchestration.',
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85',
    section1Title: 'Automation Modules',
    features: ['Contactless Entry', 'Automated Grade Sheets', 'Instant Fee Reconciliation', 'Conflict-Free Timetabling'],
    cards: [
      { title: 'Smart Admissions', description: 'Online paperless application workflows with automated eligibility verification and applicant communication.', categories: ['Admissions'], image: IMAGES.office },
      { title: 'Biometric Attendance', description: 'Real-time student and faculty attendance linked to automated parent notifications and attendance thresholds.', categories: ['Attendance'], image: IMAGES.network },
      { title: 'Fee & Billing Engine', description: 'Integrated digital payment gateways with automated invoice generation, installment tracking, and bank reconciliation.', categories: ['Finance'], image: IMAGES.techGeneral },
      { title: 'Smart Scheduling', description: 'Algorithmic timetable scheduler that optimizes room utilization, lab availability, and faculty workloads in seconds.', categories: ['Scheduling'], image: IMAGES.smartClass }
    ]
  },
  'ai-digital-design-supply': {
    heroTitle: 'AI Digital Design & Supply',
    heroSubtitle: 'Harness machine learning algorithms for optimized campus architecture, predictive procurement, and automated space planning.',
    heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1100&q=85',
    section1Title: 'Intelligent Design Services',
    cards: [
      { title: 'AI Space Planning', description: 'Algorithmic floor plan analysis maximizing daylight, acoustic privacy, and student movement efficiency.', categories: ['Planning'], image: IMAGES.architecture },
      { title: 'Smart Procurement Matrix', description: 'Automated BOQ generation and vendor matching reducing educational build procurement timelines by 40%.', categories: ['Procurement'], image: IMAGES.office },
      { title: 'Predictive Facilities Maintenance', description: 'IoT sensor analytics anticipating HVAC, electrical, and lab maintenance before disruptions occur.', categories: ['Maintenance'], image: IMAGES.server },
      { title: 'Digital Twin Modeling', description: 'Interactive 3D virtual campus models allowing leadership to simulate future expansions and energy usage.', categories: ['Simulation'], image: IMAGES.techGeneral }
    ]
  },
  'ai-stations': {
    heroTitle: 'AI & Data Science Stations',
    heroSubtitle: 'High-performance compute clusters and specialized workstations designed for applied artificial intelligence education.',
    heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1100&q=80',
    section1Title: 'AI Lab Configurations',
    cards: [
      { title: 'GPU Deep Learning Pods', description: 'Dedicated liquid-cooled tensor-core workstations preconfigured with PyTorch, TensorFlow, and CUDA runtimes.', categories: ['Hardware'], image: IMAGES.robotics },
      { title: 'Computer Vision Testbeds', description: 'Camera rigs and sensor arrays for edge AI inference, autonomous navigation, and facial recognition experiments.', categories: ['Vision'], image: IMAGES.smartClass },
      { title: 'NLP Research Terminals', description: 'High-memory workstations optimized for fine-tuning large language models and speech processing pipelines.', categories: ['Language'], image: IMAGES.display },
      { title: 'Robotics Integration Hub', description: 'Mechatronic benches with robotic arms, microcontrollers, and ROS (Robot Operating System) development kits.', categories: ['Robotics'], image: IMAGES.microscope }
    ]
  },
  'innovation-centres': {
    heroTitle: 'Campus Innovation Centres',
    heroSubtitle: 'Interdisciplinary incubation spaces where academic research transforms into working prototypes and entrepreneurial ventures.',
    heroImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Innovation Facilities',
    cards: [
      { title: 'Rapid Prototyping Maker Lab', description: 'Industrial 3D printers, laser cutters, and CNC routers allowing students to fabricate physical concepts.', categories: ['Prototyping'], image: IMAGES.robotics },
      { title: 'Venture Incubation Pods', description: 'Acoustically treated meeting zones and presentation amphitheaters for student startup pitches and mentorship.', categories: ['Incubation'], image: IMAGES.office },
      { title: 'IoT & Embedded Systems Bay', description: 'Oscilloscopes, soldering stations, and circuit printing machines for next-generation hardware development.', categories: ['Hardware'], image: IMAGES.techGeneral },
      { title: 'Design Thinking Studios', description: 'Movable whiteboard walls, reconfigurable tiered seating, and ideation tools for collaborative workshops.', categories: ['Ideation'], image: IMAGES.table }
    ]
  },
  'campus-design-execution': {
    heroTitle: 'Campus Design & Turnkey Execution',
    heroSubtitle: 'From master master-planning and statutory approvals to interior fit-outs and landscape architecture.',
    heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Execution Services',
    cards: [
      { title: 'Campus Master Planning', description: 'Zoning, vehicular circulation, pedagogical clustering, and phased expansion architecture for 5 to 100+ acre sites.', categories: ['Architecture'], image: IMAGES.campus },
      { title: 'Academic Interior Architecture', description: 'Ergonomic, biophilic interior environments engineered to optimize acoustic clarity and natural illumination.', categories: ['Interiors'], image: IMAGES.office },
      { title: 'Turnkey Construction & Fitout', description: 'Comprehensive project management from civil construction through final MEP and technology commissioning.', categories: ['Turnkey'], image: IMAGES.architecture },
      { title: 'Landscape & Athletic Grounds', description: 'Sustainable water-harvesting campus greens, amphitheaters, and IAAF/FIFA certified athletic installations.', categories: ['Landscape'], image: IMAGES.sportsGeneral }
    ]
  },
  'library-management': {
    heroTitle: 'Modern Library Infrastructure',
    heroSubtitle: 'Transforming traditional libraries into vibrant multi-modal knowledge discovery centres.',
    heroImage: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Library Solutions',
    cards: [
      { title: 'High-Density Stacks', description: 'Heavy-gauge steel shelving systems with modular bays for extensive volume capacity and smooth patron access.', categories: ['Storage'], image: IMAGES.bookshelf },
      { title: 'Acoustic Study Pods', description: 'Individual and semi-private study carrels with integrated power hubs, task lighting, and sound dampening.', categories: ['Study'], image: IMAGES.chair },
      { title: 'Digital Research Commons', description: 'OPAC discovery kiosks, digital catalog stations, and high-speed terminals for online scholarly journals.', categories: ['Technology'], image: IMAGES.display },
      { title: 'Collaborative Reading Lounges', description: 'Soft seating and movable breakout tables that support peer discussion without disturbing quiet zones.', categories: ['Lounge'], image: IMAGES.table }
    ]
  },
  'furniture': {
    heroTitle: 'Campus Furniture Solutions',
    heroSubtitle: 'Durable, ergonomic, and aesthetic educational furniture built to withstand rigorous daily institutional use.',
    heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Furniture Collections',
    cards: [
      { title: 'Classroom Desks & Benches', description: 'Dual desks and individual ergonomic study stations engineered with anti-scratch surfaces and rounded safety edges.', categories: ['Classroom'], image: IMAGES.desk },
      { title: 'Auditorium & Lecture Chairs', description: 'Tip-up acoustic seating with integrated writing tablets and heavy-gauge steel supports.', categories: ['Auditorium'], image: IMAGES.chair },
      { title: 'Laboratory Workbenches', description: 'Chemical-resistant phenolic resin surfaces equipped with sinks, gas spigots, and reagent storage.', categories: ['Lab'], image: IMAGES.table },
      { title: 'Library & Lounge Seating', description: 'Curved collaborative couches, ottoman clusters, and heavy-duty steel book stacks.', categories: ['Library'], image: IMAGES.bookshelf }
    ]
  },
  'about-us': {
    heroTitle: 'About CampusMart',
    heroSubtitle: 'A national consortium of architects, educationalists, and infrastructure engineers delivering turnkey institutional spaces.',
    heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Our Mission & Leadership',
    cards: [
      { title: 'Curriculum-Mapped Infrastructure', description: 'Every space we build is mapped to practical learning outcomes and NEP 2020 pedagogical guidelines.', categories: ['Approach'], image: IMAGES.smartClass },
      { title: '4000+ Partner Campuses', description: 'Trusted across India by premier universities, K-12 school chains, and state technical education boards.', categories: ['Scale'], image: IMAGES.campus },
      { title: 'Turnkey Excellence', description: 'From initial 3D BIM design to physical handover, we manage architecture, procurement, and execution.', categories: ['Delivery'], image: IMAGES.architecture }
    ]
  },
  'colleges-universities-for-sale': {
    heroTitle: 'Educational Institutions for Acquisition & Investment',
    heroSubtitle: 'Confidential marketplace connecting verified institutional trustees with qualified education operators and investors.',
    heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    section1Title: 'Active Opportunities',
    cards: [
      { title: 'CBSE K-12 Campus in Uttar Pradesh', description: 'Established 87,000 sq.ft. operational campus with 800+ enrolled students, residential hostel, and sports arenas.', categories: ['K-12'], image: IMAGES.campus },
      { title: 'Engineering College Campus in Maharashtra', description: 'AICTE-approved 22-acre institutional facility with 1200 capacity, advanced labs, and accreditation ready.', categories: ['Higher Ed'], image: IMAGES.architecture },
      { title: 'Pre-School Network in Haryana', description: 'Profitable network of 5 feeder primary schools and play centers seeking strategic capital expansion.', categories: ['Pre-School'], image: IMAGES.smartClass }
    ]
  }
};

async function run() {
  console.log('🚀 Starting complete dummy data & image reconciliation...');

  // 1. Reconcile Pages
  let pagesUpdated = 0;
  const allPages = await prisma.page.findMany();

  for (const page of allPages) {
    let changed = false;
    let data = {};

    if (page.pageData && page.pageData.trim() !== '' && page.pageData !== '{}') {
      try {
        data = JSON.parse(page.pageData);
      } catch (e) {
        data = {};
      }
    }

    // Check if predefined template exists for this slug
    const template = PAGE_TEMPLATES[page.slug];

    if (Object.keys(data).length === 0 && template) {
      data = template;
      changed = true;
    } else {
      // Check heroImage
      if (data.heroImage && data.heroImage.startsWith('/uploads/')) {
        const rel = data.heroImage.replace(/^\/uploads\//, '');
        if (!fs.existsSync(path.join(uploadsDir, rel))) {
          data.heroImage = template?.heroImage || IMAGES.campus;
          changed = true;
        }
      }

      // Check cards
      if (Array.isArray(data.cards) && data.cards.length > 0) {
        data.cards = data.cards.map((c, i) => {
          let img = c.image;
          if (img && img.startsWith('/uploads/')) {
            const rel = img.replace(/^\/uploads\//, '');
            if (!fs.existsSync(path.join(uploadsDir, rel))) {
              img = template?.cards?.[i]?.image || pickProductImage(c.title);
              changed = true;
            }
          } else if (!img && template?.cards?.[i]?.image) {
            img = template.cards[i].image;
            changed = true;
          }
          return { ...c, image: img };
        });
      } else if (template?.cards) {
        data.cards = template.cards;
        changed = true;
      }

      // Check section2Cards
      if (Array.isArray(data.section2Cards)) {
        data.section2Cards = data.section2Cards.map((c, i) => {
          let img = c.image;
          if (img && img.startsWith('/uploads/')) {
            const rel = img.replace(/^\/uploads\//, '');
            if (!fs.existsSync(path.join(uploadsDir, rel))) {
              img = pickProductImage(c.title);
              changed = true;
            }
          }
          return { ...c, image: img };
        });
      }
    }

    if (changed) {
      await prisma.page.update({
        where: { slug: page.slug },
        data: { pageData: JSON.stringify(data) }
      });
      pagesUpdated++;
      console.log(`✓ Reconciled page: /${page.slug}`);
    }
  }

  // 2. Reconcile Products
  let productsUpdated = 0;
  const products = await prisma.product.findMany();

  for (const prod of products) {
    let needsImage = false;
    if (!prod.imageUrl || prod.imageUrl.trim() === '') {
      needsImage = true;
    } else if (prod.imageUrl.startsWith('/uploads/')) {
      const rel = prod.imageUrl.replace(/^\/uploads\//, '');
      if (!fs.existsSync(path.join(uploadsDir, rel))) {
        needsImage = true;
      }
    }

    if (needsImage) {
      const newImg = pickProductImage(prod.name);
      await prisma.product.update({
        where: { id: prod.id },
        data: { imageUrl: newImg }
      });
      productsUpdated++;
    }
  }

  console.log(`\n🎉 DONE!`);
  console.log(`Pages updated with verified dummy data & clean images: ${pagesUpdated}`);
  console.log(`Products updated with clean, relevant Unsplash images: ${productsUpdated}`);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
