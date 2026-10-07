/**
 * Production seed runner — compiled to dist/runSeed.js by tsc.
 * Called by the Railway start command to create the admin user and seed
 * homepage content on first deploy (upsert is safe to re-run).
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Homepage feature cards (masonry grid) ─────────────────────────────────
const HOME_FEATURES = [
    { title: 'Digital Transformation', description: 'Cutting-edge digital infrastructure transforming how modern campuses operate and learn.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=90', href: '/digital-transformation', tag: 'Digital', color: '#3B82F6', h: 340 },
    { title: 'AI-Powered Learning Stations', description: 'Intelligent AI stations personalising education for every student at every level.', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=90', href: '/ai-stations', tag: 'AI & Tech', color: '#8B5CF6', h: 220 },
    { title: 'Innovation Centres', description: 'Purpose-built spaces designed to unlock creativity, collaboration and breakthrough thinking.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=90', href: '/innovation-centres', tag: 'Innovation', color: '#EC4899', h: 270 },
    { title: 'Smart Classrooms', description: 'IoT-connected rooms with interactive boards, real-time analytics and immersive tools.', image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=90', href: '/smart-classrooms', tag: 'Tech Infra', color: '#06B6D4', h: 220 },
    { title: 'Campus Furniture Design', description: 'Thoughtfully engineered, ergonomic furniture that elevates the academic experience.', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=90', href: '/furniture', tag: 'Furniture', color: '#F59E0B', h: 360 },
    { title: 'Sports Infrastructure', description: 'World-class athletic facilities nurturing champions, wellness, and team spirit.', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=90', href: '/sports-infra', tag: 'Sports', color: '#10B981', h: 240 },
    { title: 'Library Management', description: 'AI-driven smart library solutions providing seamless access to global knowledge.', image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=90', href: '/library-management', tag: 'Library', color: '#6366F1', h: 300 },
    { title: 'Science & Tech Labs', description: 'Fully equipped STEM laboratories built for discovery, experimentation and innovation.', image: 'https://images.unsplash.com/photo-1532094349884-543290e34c7d?auto=format&fit=crop&w=800&q=90', href: '/labs', tag: 'Labs', color: '#14B8A6', h: 200 },
    { title: 'Campus Master Planning', description: 'Visionary campus planning from concept to construction, built to inspire generations.', image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=90', href: '/campus-design', tag: 'Planning', color: '#F97316', h: 320 },
    { title: 'AR / VR Learning', description: 'Immersive reality experiences bringing complex concepts to vivid, unforgettable life.', image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=90', href: '/ar-vr-learning', tag: 'AR / VR', color: '#A855F7', h: 240 },
    { title: 'Campus Automation', description: 'Smart systems automating admissions, attendance, finance and governance seamlessly.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=90', href: '/campus-automation', tag: 'Automation', color: '#0EA5E9', h: 200 },
    { title: 'Collaboration Spaces', description: 'Dynamic, flexible zones engineered for productive teamwork and creative ideation.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=90', href: '/collaboration', tag: 'Spaces', color: '#EF4444', h: 260 },
];

// ── Sidebar content ───────────────────────────────────────────────────────
const HOME_SIDEBAR = {
    classifieds: [
        { label: 'Colleges / Universities for Sale', href: '/colleges-universities-for-sale' },
        { label: 'Education Infra Funding', href: '/classifieds' },
        { label: 'Partner with Running Colleges', href: '/partnership' },
    ],
    resources: [
        { label: 'Complete Guide on AI Implementation', href: '/ai-guide' },
        { label: 'Setting Up a College in India', href: '/setup-college' },
        { label: 'UGC Guidelines for Digital Campus', href: '/ugc-guidelines' },
        { label: 'Product Catalog 2025', href: '/product-catalog' },
        { label: 'Lookbook – Play Furniture', href: '/lookbook' },
    ],
    completedProjects: [
        { label: 'Campus Master Planning', href: '/catalogues' },
        { label: '20 Stunning College Buildings', href: '/catalogues' },
        { label: 'Academic buildings', href: '/catalogues' },
        { label: 'Research facilities', href: '/catalogues' },
        { label: 'Student life centers', href: '/catalogues' },
        { label: 'Athletic complexes', href: '/catalogues' },
    ],
    contacts: [
        { bg: '#FFD700', title: 'Design & Architecture', contact: 'info@campusmart.in', href: 'mailto:info@campusmart.in', isEmail: true },
        { bg: '#00c4cc', title: 'Campus Innovations', contact: '9966109191', href: 'tel:+919966109191', isEmail: false },
        { bg: '#C8FF00', title: 'Partner Campus', contact: '9866091111', href: 'tel:+919866091111', isEmail: false },
    ],
};

// ── Inner page data ───────────────────────────────────────────────────────
const PAGE_DATA: Record<string, object> = {
    'colleges-universities-for-sale': {
        heroTitle: 'Businesses for Sale and Investment',
        heroSubtitle: 'Showing businesses for sale and investment. Buy or invest in a business listed by direct business owners and business brokers.',
        filterLabel: 'cbse schools',
        cards: [
            { title: 'School for Sale in Bahraich, India', description: 'CBSE school with 800+ students, day and boarding facility for sale in Bahraich. The school encompasses a total area of 87,000 square feet and includes approximately 40 rooms, fully equipped science and computer labs.', location: 'Bahraich', rating: '6.8', sales: 'INR 2.6 crore', margin: '40 %', askingPrice: 'INR 20 Cr', premium: true, image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80' },
            { title: 'Playschool Seeking Loan in Haryana, India', description: 'Education society in Haryana with 5 CBSE schools and 70 playschools. This is an educational society with primary and play schools seeking growth funding.', location: 'Haryana', rating: '6.8', sales: 'INR 30 crore', margin: '25 %', askingPrice: 'INR 5 Cr at 15%', premium: true, image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=80' },
            { title: 'School for Sale in Thiruvananthapuram, India', description: 'CBSE-affiliated school with 400+ students and owned facilities. Located in Thiruvananthapuram, this school offers quality education from a well-established campus.', location: 'Thiruvananthapuram', rating: '6.2', sales: 'INR 1.6 crore', margin: '10 - 20 %', askingPrice: 'INR 8 Cr', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=700&q=80' },
            { title: 'Residential School Opportunity in Karnataka', description: 'Established residential school with modern classrooms, hostel facilities, and a growing student community.', location: 'Karnataka', rating: '6.5', sales: 'INR 12 crore', margin: '30 %', askingPrice: 'INR 18 Cr', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80' },
            { title: 'International School Investment Opportunity', description: 'Premium school campus with sports facilities, digital classrooms, and strong long-term investment potential.', location: 'Pune', rating: '7.1', sales: 'INR 22 crore', margin: '35 %', askingPrice: 'INR 32 Cr', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80' },
            { title: 'College Campus Available for Partnership', description: 'Fully operational higher education campus with laboratories, library infrastructure, and flexible partnership options.', location: 'Delhi NCR', rating: '6.7', sales: 'INR 40 crore', margin: '28 %', askingPrice: 'INR 55 Cr', image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=700&q=80' },
        ],
    },
    'ai-ml': {
        heroTitle: 'AI & Machine Learning',
        heroSubtitle: 'Cutting-edge AI and ML solutions for educational institutions. Prepare students for the future with hands-on learning experiences.',
        heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'AI/ML Solutions',
        section2Title: 'Future-Ready Education',
        cards: [
            { title: 'AI Learning Stations', description: 'Interactive AI-powered learning environments' },
            { title: 'ML Labs', description: 'Machine learning experimentation setups' },
            { title: 'Coding Platforms', description: 'Programming and development environments' },
            { title: 'Computing Infrastructure', description: 'High-performance computing solutions' },
        ],
    },
    'campus-design': {
        heroTitle: 'Campus Design',
        heroSubtitle: 'Transform your educational vision into reality with our comprehensive campus design services. We create spaces that inspire learning and foster innovation.',
        heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Design Services',
        section2Title: 'Why Choose Our Campus Design?',
        ctaTitle: 'Ready to Design Your Dream Campus?',
        ctaSubtitle: 'Let our expert team help you create a campus that inspires and empowers.',
        cards: [
            { title: 'Master Planning', description: 'Comprehensive campus master planning for new and existing institutions.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
            { title: 'Architectural Design', description: 'Innovative architectural solutions for educational buildings.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
            { title: 'Interior Design', description: 'Functional and aesthetic interior spaces for learning.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
            { title: 'Landscape Design', description: 'Outdoor spaces that enhance the campus environment.', image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
        ],
        features: [
            'Space optimization and utilization analysis',
            'Sustainable and eco-friendly design',
            'NEP 2020 compliant layouts',
            'Accessibility and inclusivity',
            'Future-ready infrastructure',
            'Cost-effective solutions',
        ],
    },
    'furniture': {
        heroTitle: 'Furniture Solutions',
        heroSubtitle: 'Premium quality furniture designed for educational institutions. From classrooms to libraries, we provide durable and ergonomic solutions.',
        heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Furniture Categories',
        section2Title: 'Why Our Furniture?',
        cards: [
            { title: 'Classroom Furniture', description: '45 products', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Library Furniture', description: '28 products', image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Office Furniture', description: '32 products', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Hostel Furniture', description: '18 products', image: 'https://images.unsplash.com/photo-1505693416388-b0346ef414b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Play Furniture', description: '24 products', image: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Premium Furniture', description: '15 products', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
        features: [
            'Ergonomic designs for comfort',
            'Durable and long-lasting materials',
            'Customizable options available',
            'Eco-friendly manufacturing',
            'Bulk order discounts',
            'Installation services included',
        ],
    },
    'labs': {
        heroTitle: 'Laboratory Solutions',
        heroSubtitle: 'State-of-the-art laboratory setups for schools and colleges. From STEM labs to specialized research facilities, we deliver excellence.',
        heroImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Lab Types',
        cards: [
            { title: 'Chemistry Lab', description: 'Fully equipped chemistry laboratories with modern apparatus', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Physics Lab', description: 'Advanced physics experimentation environments', image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Biology Lab', description: 'Complete biology and science labs', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Computer Lab', description: 'High-spec computer labs for digital learning', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'libraries': {
        heroTitle: 'Library Solutions',
        heroSubtitle: 'Modern libraries designed to serve as knowledge hubs. From traditional reading rooms to digital resource centers, we create inspiring learning spaces.',
        heroImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Library Solutions',
        cards: [
            { title: 'Traditional Libraries', description: 'Classic reading rooms with comprehensive book collections', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Digital Libraries', description: 'E-learning resources and digital content access', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Study Zones', description: 'Quiet study areas and collaborative group spaces', image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Library Management', description: 'Smart library management systems and cataloguing', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'innovation': {
        heroTitle: 'Innovation Centers',
        heroSubtitle: 'Create spaces that nurture creativity and innovation. From maker spaces to research centers, we build environments that inspire breakthrough thinking.',
        heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Innovation Solutions',
        cards: [
            { title: 'Innovation Labs', description: 'Spaces for creative thinking and prototyping' },
            { title: 'Startup Incubators', description: 'Support for student entrepreneurship' },
            { title: 'Research Centers', description: 'Dedicated research and development spaces' },
            { title: 'Maker Spaces', description: 'Hands-on creation and experimentation areas' },
        ],
    },
    'sports-infra': {
        heroTitle: 'Sports Infrastructure',
        heroSubtitle: 'World-class sports facilities for schools and colleges. We design and build sports infrastructure that promotes physical education and athletic excellence.',
        heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Sports Facilities',
        cards: [
            { title: 'Indoor Sports', description: 'Basketball, badminton, volleyball courts and gymnasiums', image: 'https://images.unsplash.com/photo-1546519638405-a9a10ea4b1b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Outdoor Facilities', description: 'Football fields, running tracks, and cricket grounds', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Aquatic Centers', description: 'Swimming pools and aquatic training facilities', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Fitness Centers', description: 'Modern gymnasium and fitness equipment', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
        features: [
            'NEP 2020 sports curriculum compliance',
            'Professional grade equipment',
            'Safety-first design approach',
            'Multi-sport versatile spaces',
            'Flood-lighting for evening use',
            'Spectator seating and facilities',
        ],
    },
    'tech-infra': {
        heroTitle: 'Technology Infrastructure',
        heroSubtitle: 'Future-proof your campus with cutting-edge technology infrastructure. From high-speed networks to smart classrooms, we build the digital backbone of modern education.',
        heroImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Technology Solutions',
        cards: [
            { title: 'Network Infrastructure', description: 'High-speed campus-wide Wi-Fi and LAN systems', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Smart Classrooms', description: 'Interactive boards, projectors, and AV systems', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Data Centers', description: 'Campus servers, cloud integration and data management', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Security Systems', description: 'CCTV surveillance, access control and safety systems', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'collaboration': {
        heroTitle: 'Collaboration Spaces',
        heroSubtitle: 'Foster teamwork and creativity with purpose-built collaboration environments. Modern spaces designed to bring students and faculty together.',
        heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Collaboration Solutions',
        cards: [
            { title: 'Group Study Rooms', description: 'Sound-isolated rooms with whiteboards and AV equipment', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Conference Halls', description: 'Fully equipped conference and seminar halls', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Open Work Zones', description: 'Flexible, open-plan areas inspiring creativity', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Digital Hubs', description: 'Technology-rich spaces for digital collaboration', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'corporate': {
        heroTitle: 'About CampusMart',
        heroSubtitle: 'CampusMart is a consortium of architects, designers, campus innovators who strive to bring the learning outcome through latest infrastructure and edtech. The first ever company in Asia to bring curriculum mapped solutions to campus industry.',
        heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Corporate Services',
        cards: [
            { title: 'Office Design', description: 'Modern office interiors and workspace solutions', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Conference Facilities', description: 'Professional meeting rooms and boardrooms', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Training Centers', description: 'Purpose-built training and learning centers', image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Campus Canteens', description: 'Cafeteria and food court design and setup', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
        features: [
            'Space planning and optimization',
            'Ergonomic and wellness-focused design',
            'Brand identity integration',
            'Sustainability and green design',
            'Technology integration',
            'Turnkey project delivery',
        ],
    },
    'ai-guide': {
        heroTitle: 'AI Implementation Guide',
        heroSubtitle: 'Your comprehensive guide to implementing AI solutions in educational institutions. Step-by-step roadmap for digital transformation.',
        heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'AI Implementation Steps',
        cards: [
            { title: 'Assessment', description: 'Evaluate your current infrastructure and readiness' },
            { title: 'Planning', description: 'Develop a customized AI integration roadmap' },
            { title: 'Implementation', description: 'Deploy AI solutions with expert guidance' },
            { title: 'Training', description: 'Empower teachers and staff with AI skills' },
        ],
    },
    'ai-stations': {
        heroTitle: 'AI Learning Stations',
        heroSubtitle: 'Dedicated AI-powered learning stations that bring artificial intelligence education into the classroom.',
        heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Station Features',
        cards: [
            { title: 'Interactive AI Models', description: 'Hands-on AI model training and testing' },
            { title: 'Robotics Integration', description: 'AI-powered robotics kits and projects' },
            { title: 'Data Science Tools', description: 'Real-world data analysis and visualization tools' },
            { title: 'Course Content', description: 'Curriculum-aligned AI and ML modules' },
        ],
    },
    'campus-automation': {
        heroTitle: 'Campus Automation',
        heroSubtitle: 'Smart automation solutions that make your campus more efficient, secure, and sustainable.',
        heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Automation Systems',
        cards: [
            { title: 'Smart Attendance', description: 'Biometric and RFID-based attendance systems' },
            { title: 'Energy Management', description: 'Automated lighting, HVAC and energy monitoring' },
            { title: 'Smart Security', description: 'Integrated CCTV and access control systems' },
            { title: 'Building Management', description: 'Centralized building management and control' },
        ],
    },
    'campus-design-execution': {
        heroTitle: 'Campus Design & Execution',
        heroSubtitle: 'From blueprints to completion — we handle every phase of your campus design and construction project.',
        heroImage: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Execution Process',
        cards: [
            { title: 'Site Survey', description: 'Accurate site surveys and feasibility studies' },
            { title: 'Design & Planning', description: 'Architectural and interior design development' },
            { title: 'Construction', description: 'Quality-focused construction management' },
            { title: 'Handover', description: 'Final inspection, testing, and project handover' },
        ],
    },
    'digital-transformation': {
        heroTitle: 'Digital Transformation',
        heroSubtitle: "Accelerate your institution's digital transformation journey with our expert guidance and proven solutions.",
        heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Transformation Areas',
        cards: [
            { title: 'Digital Learning', description: 'E-learning platforms and digital curriculum delivery' },
            { title: 'Administration', description: 'ERP and management information systems' },
            { title: 'Communication', description: 'Digital portals for students, parents and staff' },
            { title: 'Analytics', description: 'Data analytics and institution performance dashboards' },
        ],
    },
    'furniture-design-supply': {
        heroTitle: 'Furniture Design & Supply',
        heroSubtitle: 'End-to-end furniture solutions for educational institutions — from custom design to delivery and installation.',
        heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Services',
        cards: [
            { title: 'Custom Design', description: 'Bespoke furniture tailored to your space and needs', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Bulk Supply', description: 'Large-scale procurement with competitive pricing', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Modular Systems', description: 'Flexible modular furniture for dynamic spaces', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Installation', description: 'Professional installation and assembly services', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'innovation-centres': {
        heroTitle: 'Innovation Centres',
        heroSubtitle: 'Build world-class innovation centres that empower students to create, experiment, and transform ideas into reality.',
        heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Centre Components',
        cards: [
            { title: 'Prototyping Lab', description: '3D printers, laser cutters, and fabrication tools' },
            { title: 'Ideation Lounge', description: 'Creative zones with whiteboards and collaboration tools' },
            { title: 'Demo Day Stage', description: 'Presentation and demo spaces for showcasing projects' },
            { title: 'Mentorship Hub', description: 'Dedicated space for mentoring and expert sessions' },
        ],
    },
    'library-management': {
        heroTitle: 'Library Management Systems',
        heroSubtitle: 'Digital library management solutions to automate cataloging, circulation, and patron management.',
        heroImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'System Features',
        cards: [
            { title: 'Digital Catalogue', description: 'Searchable digital catalogue for all resources' },
            { title: 'Book Issue & Return', description: 'Automated issue and return tracking' },
            { title: 'Member Portal', description: 'Self-service portal for students and faculty' },
            { title: 'Reports & Analytics', description: 'Detailed usage reports and borrowing trends' },
        ],
    },
    'lms': {
        heroTitle: 'Learning Management Systems',
        heroSubtitle: 'Powerful LMS platforms that bring your curriculum, teachers, and students together in one digital space.',
        heroImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'LMS Features',
        cards: [
            { title: 'Course Management', description: 'Create, organize and deliver digital courses easily' },
            { title: 'Assessments', description: 'Online quizzes, assignments and grading' },
            { title: 'Video Learning', description: 'Recorded lectures and live virtual classrooms' },
            { title: 'Progress Tracking', description: 'Real-time student performance and engagement analytics' },
        ],
    },
    'sports-design-execution': {
        heroTitle: 'Sports Design & Execution',
        heroSubtitle: 'Complete sports facility design and construction services — from concept to final handover.',
        heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Our Approach',
        cards: [
            { title: 'Sport-Specific Design', description: 'Custom designs meeting international sports standards' },
            { title: 'Material Sourcing', description: 'High-quality certified sports surface materials' },
            { title: 'Construction', description: 'Expert construction with minimal disruption' },
            { title: 'Certification', description: 'Sports facilities certified to national/international standards' },
        ],
    },
    'partnership': {
        heroTitle: 'Partner with CampusMart',
        heroSubtitle: 'Join our network of trusted partners and together build better educational ecosystems across India.',
        heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Partnership Models',
        cards: [
            { title: 'Vendor Partnership', description: 'Supply products through our campus marketplace' },
            { title: 'Design Collaboration', description: 'Partner on large campus design projects' },
            { title: 'Technology Alliance', description: 'Integrate your technology with our platforms' },
            { title: 'Academic Partnership', description: 'Educational and training program collaboration' },
        ],
        features: [
            'Access to 1000+ institutions nationwide',
            'Co-marketing and branding opportunities',
            'Priority project consideration',
            'Dedicated partner success manager',
            'Revenue sharing models',
        ],
    },
    'new-environments': {
        heroTitle: 'New Learning Environments',
        heroSubtitle: 'Reimagining educational spaces for the 21st century learner. Future-forward environments designed for creativity, collaboration, and exploration.',
        heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Environment Types',
        cards: [
            { title: 'Flexible Classrooms', description: 'Adaptable spaces that support multiple teaching modes', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Outdoor Learning', description: 'Nature-integrated learning spaces and gardens', image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'STEM Hubs', description: 'Dedicated science, technology, engineering and math hubs', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Wellness Zones', description: 'Meditation, mindfulness and mental wellness areas', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'assessment-system': {
        heroTitle: 'Assessment Systems',
        heroSubtitle: 'Modern assessment solutions that move beyond traditional exams. Holistic evaluation tools designed for 21st century education.',
        heroImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Assessment Tools',
        cards: [
            { title: 'Online Assessments', description: 'Proctored online exams and quizzes' },
            { title: 'Continuous Assessment', description: 'Ongoing assessments aligned with NEP 2020' },
            { title: 'Portfolio Assessment', description: 'Student portfolio and project evaluation' },
            { title: 'Competency Mapping', description: 'Skills and competency based assessment frameworks' },
        ],
    },
    'ai-digital-design-supply': {
        heroTitle: 'AI-Enabled Digital Design & Supply',
        heroSubtitle: 'Transforming campus design and procurement with AI-powered tools for faster decisions and smarter supply chains.',
        heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'AI-Powered Services',
        cards: [
            { title: 'AI Space Planning', description: 'AI-optimized campus layout and space utilization analysis' },
            { title: 'Smart Procurement', description: 'Intelligent vendor selection and cost optimization' },
            { title: 'Predictive Maintenance', description: 'AI-driven maintenance scheduling and alerts' },
            { title: 'Digital Twin', description: 'Virtual campus simulation before construction begins' },
        ],
    },
    'setup-college': {
        heroTitle: 'Setup Your College',
        heroSubtitle: 'Your one-stop guide to setting up a new educational institution from scratch — infrastructure, technology, and compliance.',
        heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Setup Steps',
        cards: [
            { title: 'Regulatory Compliance', description: 'UGC, AICTE and state board compliance guidance' },
            { title: 'Infrastructure Planning', description: 'Campus planning, layout and specification development' },
            { title: 'Procurement', description: 'Furniture, labs, technology and library procurement' },
            { title: 'Launch Support', description: 'Operational support from day one' },
        ],
    },
    'lookbook': {
        heroTitle: 'CampusMart Lookbook',
        heroSubtitle: 'Explore our portfolio of completed campus transformations. Get inspired by real projects across India.',
        heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Featured Projects',
        cards: [
            { title: 'IIT Campus Revamp', description: 'Complete modernization of labs and library', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'CBSE School Setup', description: 'New campus design and furniture supply', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Corporate University', description: 'Innovation center and collaboration spaces', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Sports Academy', description: 'Full sports infrastructure development', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'ugc-guidelines': {
        heroTitle: 'UGC Guidelines',
        heroSubtitle: 'Stay compliant with the latest University Grants Commission guidelines. Your comprehensive reference for UGC regulations and requirements.',
        heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Key Guidelines',
        cards: [
            { title: 'Infrastructure Standards', description: 'Minimum infrastructure requirements for colleges' },
            { title: 'Library Requirements', description: 'UGC minimum library and resource requirements' },
            { title: 'Lab Standards', description: 'Approved laboratory layouts and equipment standards' },
            { title: 'Digital Initiatives', description: 'SWAYAM, NPTEL and digital learning compliance' },
        ],
    },
    'product-catalog': {
        heroTitle: 'Product Catalog',
        heroSubtitle: 'Browse our comprehensive catalog of educational infrastructure products — furniture, lab equipment, technology, and more.',
        heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        section1Title: 'Product Categories',
        cards: [
            { title: 'Furniture', description: 'School desks, chairs, lab benches and more', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Lab Equipment', description: 'Science apparatus and lab consumables', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Technology', description: 'Smartboards, computers, tablets and AV equipment', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { title: 'Sports Equipment', description: 'Sports goods for indoor and outdoor activities', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
    },
    'services': {
        heroTitle: 'Our Services',
        heroSubtitle: 'Comprehensive campus transformation services from master planning to final execution.',
        cards: [
            {
                title: 'Campus Design & Execution',
                description: 'Comprehensive master planning and architectural design services tailoring educational spaces for future-ready learning.',
                href: '/campus-design-execution',
                color: 'bg-blue-600'
            },
            {
                title: 'Furniture Design & Supply',
                description: 'Ergonomic and modular furniture solutions for classrooms, laboratories, libraries, and administrative offices.',
                href: '/furniture-design-supply',
                color: 'bg-cm-green'
            },
            {
                title: 'Sports Design & Execution',
                description: 'Premier sports infrastructure including synthetic tracks, indoor courts, and outdoor recreational areas.',
                href: '/sports-design-execution',
                color: 'bg-cm-yellow'
            },
            {
                title: 'AI/Digital Solutions',
                description: 'Physical and digital integrations including smart classes, AI labs, and digital infrastructure for modern education.',
                href: '/ai-digital-design-supply',
                color: 'bg-purple-600'
            }
        ]
    },
    'solutions': {
        heroTitle: 'Functional Solutions',
        heroSubtitle: 'Specialized environments optimized for specific learning outcomes and operational efficiency.',
        cards: [
            {
                title: 'Laboratories',
                description: 'Advanced science and technology labs equipped with modern safety and learning tools.',
                href: '/labs',
                color: 'bg-cm-blue'
            },
            {
                title: 'Libraries',
                description: 'Next-generation libraries combining traditional resources with digital learning environments.',
                href: '/libraries',
                color: 'bg-cm-yellow'
            },
            {
                title: 'Innovation Centres',
                description: 'Dedicated spaces for creative thinking, prototyping, and interdisciplinary collaboration.',
                href: '/innovation-centres',
                color: 'bg-cm-green'
            },
            {
                title: 'Learning Environments',
                description: 'Flexible classrooms and open spaces designed for active, collaborative learning.',
                href: '/new-environments',
                color: 'bg-orange-500'
            },
            {
                title: 'AI Stations',
                description: 'Dedicated hubs for artificial intelligence exploration and digital literacy.',
                href: '/ai-stations',
                color: 'bg-purple-600'
            }
        ]
    },
};

async function seed() {
    console.log('🌱 Running production seed...');

    // ── Idempotent 1-Time Seed Guard ──────────────────────────────────────
    const bootstrapFlag = await prisma.siteContent.findUnique({
        where: { key: 'system_bootstrapped' },
    });
    if (bootstrapFlag?.value === 'true') {
        console.log('🔒 Database already bootstrapped (system_bootstrapped = true). Exiting seed safely without altering data.');
        await prisma.$disconnect();
        return;
    }

    // ── Admin user ────────────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@campusmart.in';
    const existingAdmin = await prisma.user.findFirst({
        where: { email: { equals: adminEmail, mode: 'insensitive' } },
    });

    if (existingAdmin) {
        await prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
                role: 'admin',
                emailVerified: true,
                name: existingAdmin.name || 'CampusMart Admin',
            },
        });
        console.log(`✓ Admin user verified: ${adminEmail} (existing credentials preserved)`);
    } else {
        const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@1234';
        const adminHash = await bcrypt.hash(initialPassword, 10);
        await prisma.user.create({
            data: {
                name: 'CampusMart Admin',
                email: adminEmail,
                passwordHash: adminHash,
                role: 'admin',
                emailVerified: true,
                phone: '+91 98765 00000',
                institution: 'CampusMart',
            },
        });
        console.log(`✓ Initial admin user created: ${adminEmail}`);
    }

    // ── Test User ─────────────────────────────────────────────────────────
    const testUserEmail = 'user@campussmart.in';
    const existingTestUser = await prisma.user.findFirst({
        where: { email: { equals: testUserEmail, mode: 'insensitive' } },
    });

    if (existingTestUser) {
        await prisma.user.update({
            where: { id: existingTestUser.id },
            data: {
                role: 'user',
                emailVerified: true,
                name: existingTestUser.name || 'Demo Campus User',
            },
        });
        console.log(`✓ Test user verified: ${testUserEmail}`);
    } else {
        const userPassword = 'User@1234';
        const userHash = await bcrypt.hash(userPassword, 10);
        await prisma.user.create({
            data: {
                name: 'Demo Campus User',
                email: testUserEmail,
                passwordHash: userHash,
                role: 'user',
                emailVerified: true,
                phone: '+91 98765 11111',
                institution: 'Sample University',
            },
        });
        console.log(`✓ Test user created: ${testUserEmail}`);
    }

    // ── Hero banner ───────────────────────────────────────────────────────
    await prisma.siteContent.upsert({
        where: { key: 'home_hero' },
        update: {
            value: JSON.stringify({
                title: 'Your Complete Guide to Campus Infrastructure',
                subtitle: 'Physical + Digital',
                image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            }),
        },
        create: {
            key: 'home_hero',
            value: JSON.stringify({
                title: 'Your Complete Guide to Campus Infrastructure',
                subtitle: 'Physical + Digital',
                image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            }),
        },
    });

    // ── Service cards ─────────────────────────────────────────────────────
    await prisma.siteContent.upsert({
        where: { key: 'home_services' },
        update: {
            value: JSON.stringify([
                { title: 'Furniture Design+ Supply', bgColor: '#ef4444', textColor: '#ffffff', href: '/furniture-design-supply' },
                { title: 'Campus Design+ Execution', bgColor: '#a3e635', textColor: '#000000', href: '/campus-design-execution' },
                { title: 'Sports Design+ Execution', bgColor: '#06b6d4', textColor: '#ffffff', href: '/sports-design-execution' },
                { title: 'AI/Digital Design+ Supply', bgColor: '#a855f7', textColor: '#ffffff', href: '/ai-digital-design-supply' },
            ]),
        },
        create: {
            key: 'home_services',
            value: JSON.stringify([
                { title: 'Furniture Design+ Supply', bgColor: '#ef4444', textColor: '#ffffff', href: '/furniture-design-supply' },
                { title: 'Campus Design+ Execution', bgColor: '#a3e635', textColor: '#000000', href: '/campus-design-execution' },
                { title: 'Sports Design+ Execution', bgColor: '#06b6d4', textColor: '#ffffff', href: '/sports-design-execution' },
                { title: 'AI/Digital Design+ Supply', bgColor: '#a855f7', textColor: '#ffffff', href: '/ai-digital-design-supply' },
            ]),
        },
    });

    // ── Masonry feature cards ─────────────────────────────────────────────
    await prisma.siteContent.upsert({
        where: { key: 'home_features' },
        update: { value: JSON.stringify(HOME_FEATURES) },
        create: { key: 'home_features', value: JSON.stringify(HOME_FEATURES) },
    });

    // ── Sidebar ───────────────────────────────────────────────────────────
    const existingSidebar = await prisma.siteContent.findUnique({ where: { key: 'home_sidebar' } });
    if (!existingSidebar) {
        await prisma.siteContent.create({ data: { key: 'home_sidebar', value: JSON.stringify(HOME_SIDEBAR) } });
    } else {
        try {
            const sidebar = JSON.parse(existingSidebar.value);
            if (Array.isArray(sidebar.classifieds)) {
                const collegeListing = sidebar.classifieds.find((item: any) => item.label === 'Colleges / Universities for Sale');
                if (collegeListing && collegeListing.href === '/classifieds') {
                    collegeListing.href = '/colleges-universities-for-sale';
                    await prisma.siteContent.update({ where: { key: 'home_sidebar' }, data: { value: JSON.stringify(sidebar) } });
                }
            }
        } catch {
            console.warn('Could not migrate home_sidebar JSON');
        }
    }

    console.log('✓ Homepage content seeded (hero, services, features, sidebar)');

    // ── Categories & Products ─────────────────────────────────────────────
    const categories = [
        { name: 'Furniture', slug: 'furniture', page: 'furniture' },
        { name: 'Lab Equipment', slug: 'labs', page: 'labs' },
        { name: 'Sports', slug: 'sports', page: 'sports' },
        { name: 'Technology', slug: 'technology', page: 'furniture' },
        { name: 'Library', slug: 'library', page: 'libraries' },
    ];
    for (const cat of categories) {
        await prisma.category.upsert({ where: { slug: cat.slug }, update: { page: cat.page }, create: cat });
    }

    const catMap = await prisma.category.findMany();
    const catBySlug = Object.fromEntries(catMap.map((c) => [c.slug, c.id]));

    const products = [
        { name: 'Smart Classroom Desk', slug: 'smart-classroom-desk', description: 'Ergonomic smart desk designed for modern classrooms with cable management and adjustable height.', price: 8500, categorySlug: 'furniture', imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80', rating: 4.5, reviewCount: 28, featured: true },
        { name: 'Interactive Whiteboard 75"', slug: 'interactive-whiteboard-75', description: 'Large format 75-inch interactive whiteboard with 4K display and multi-touch capability.', price: 125000, categorySlug: 'technology', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80', rating: 4.8, reviewCount: 45, featured: true },
        { name: 'Chemistry Lab Setup', slug: 'chemistry-lab-setup', description: 'Complete chemistry lab setup with safety equipment, glassware, and storage solutions.', price: 250000, categorySlug: 'labs', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80', rating: 4.7, reviewCount: 12, featured: false },
        { name: 'Library Bookshelf Unit', slug: 'library-bookshelf-unit', description: 'Heavy-duty steel bookshelf unit with adjustable shelves, ideal for school and college libraries.', price: 15000, categorySlug: 'library', imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80', rating: 4.3, reviewCount: 36, featured: false },
        { name: 'Basketball Court Surface', slug: 'basketball-court-surface', description: 'Professional grade indoor basketball court flooring with anti-slip properties.', price: 450000, categorySlug: 'sports', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=400&q=80', rating: 4.9, reviewCount: 8, featured: true },
        { name: 'STEM Learning Kit', slug: 'stem-learning-kit', description: 'Comprehensive STEM kit with robotics, electronics, and coding modules for K-12 students.', price: 35000, categorySlug: 'labs', imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&w=400&q=80', rating: 4.6, reviewCount: 52, featured: true },
        { name: 'Ergonomic Teacher Chair', slug: 'ergonomic-teacher-chair', description: 'Premium ergonomic chair with lumbar support and adjustable armrests for teachers.', price: 12000, categorySlug: 'furniture', imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80', rating: 4.4, reviewCount: 19, featured: false },
        { name: 'Digital Library System', slug: 'digital-library-system', description: 'Complete digital library management system with barcode scanning and RFID tracking.', price: 85000, categorySlug: 'library', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=400&q=80', rating: 4.7, reviewCount: 23, featured: false },
        { name: 'Collaborative Hexagon Table', slug: 'collaborative-hexagon-table', description: 'Modular hexagonal tables that can be joined together for group activities and collaborative learning.', price: 18000, categorySlug: 'furniture', imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80', rating: 4.8, reviewCount: 15, featured: true },
        { name: 'Physics Mechanics Apparatus', slug: 'physics-mechanics-apparatus', description: 'Advanced mechanics experimental kit including inclined planes, pulleys, and motion sensors.', price: 42000, categorySlug: 'labs', imageUrl: 'https://images.unsplash.com/photo-1614935151651-0bea6508abb0?auto=format&fit=crop&w=400&q=80', rating: 4.6, reviewCount: 18, featured: false },
        { name: 'Multi-Sport Scoreboard', slug: 'multi-sport-scoreboard', description: 'Digital LED scoreboard with wireless remote control for indoor and outdoor sports facilities.', price: 55000, categorySlug: 'sports', imageUrl: 'https://images.unsplash.com/photo-1518605368461-1e12613dca60?auto=format&fit=crop&w=400&q=80', rating: 4.5, reviewCount: 21, featured: false },
        { name: 'Language Lab Software Console', slug: 'language-lab-software-console', description: 'Centralized console for language teachers to monitor, broadcast, and interact with 40+ student stations.', price: 150000, categorySlug: 'technology', imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=400&q=80', rating: 4.9, reviewCount: 33, featured: true },
        { name: 'Mobile Tablet Charging Cart', slug: 'mobile-tablet-charging-cart', description: 'Secure steel cart with built-in power strips to store and charge up to 36 tablets or Chromebooks.', price: 28000, categorySlug: 'technology', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80', rating: 4.7, reviewCount: 42, featured: false },
        { name: 'Biology Microscopy Set', slug: 'biology-microscopy-set', description: 'Set of 10 binocular compound microscopes with LED illumination and precise focusing.', price: 110000, categorySlug: 'labs', imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=400&q=80', rating: 4.8, reviewCount: 27, featured: true },
        { name: 'Acoustic Wall Panels', slug: 'acoustic-wall-panels', description: 'Sound-absorbing architectural panels to reduce echo and improve acoustics in auditoriums and classrooms.', price: 5500, categorySlug: 'furniture', imageUrl: 'https://images.unsplash.com/photo-1598016422731-50e561a069a5?auto=format&fit=crop&w=400&q=80', rating: 4.4, reviewCount: 61, featured: false },
        { name: 'Gymnastics Floor Mats', slug: 'gymnastics-floor-mats', description: 'Set of high-density folding crash mats with velcro connectors for safe indoor physical education.', price: 22000, categorySlug: 'sports', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80', rating: 4.6, reviewCount: 14, featured: false },
        { name: 'RFID Library Security Gates', slug: 'rfid-library-security-gates', description: 'Dual-aisle anti-theft RFID security gates with alarms and patron counters for modern libraries.', price: 185000, categorySlug: 'library', imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80', rating: 4.9, reviewCount: 9, featured: true },
        { name: 'Modular Makerspace Stations', slug: 'modular-makerspace-stations', description: 'Heavy-duty workshop tables with built-in pegboards, power outlets, and tool storage.', price: 34000, categorySlug: 'furniture', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80', rating: 4.7, reviewCount: 38, featured: true }
    ];

    for (const p of products) {
        const { categorySlug, ...rest } = p;
        await prisma.product.upsert({ where: { slug: rest.slug }, update: {}, create: { ...rest, categoryId: catBySlug[categorySlug] } });
    }

    // ── Blog Posts ────────────────────────────────────────────────────────
    const posts = [
        { title: 'The Future of Smart Classrooms', slug: 'future-of-smart-classrooms', excerpt: 'Explore how technology is transforming traditional classrooms into interactive learning hubs.', body: `<h2>Introduction</h2><p>Smart classrooms are revolutionizing education across India. With the integration of interactive whiteboards, student response systems, and AI-powered learning tools, schools are creating environments that foster deeper engagement and better learning outcomes.</p><h2>Key Technologies</h2><p>Interactive whiteboards, AR/VR tools, and real-time collaboration platforms are at the forefront of this transformation. These technologies allow teachers to deliver content in more dynamic and engaging ways while collecting valuable data on student performance.</p><h2>Implementation Steps</h2><p>Successful implementation requires careful planning, teacher training, and a phased rollout. Schools that invest in professional development alongside technology see the best results.</p><h2>Conclusion</h2><p>The future of education lies in seamlessly blending technology with proven pedagogical approaches. Smart classrooms are not just about gadgets — they are about creating better learning experiences for every student.</p>`, imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-01-15') },
        { title: 'NEP 2020 Implementation Guide', slug: 'nep-2020-implementation-guide', excerpt: 'A comprehensive guide to implementing NEP 2020 in your institution with practical steps and resources.', body: `<h2>Understanding NEP 2020</h2><p>The National Education Policy 2020 represents the most comprehensive education reform in India in decades. It introduces multidisciplinary education, vocational training, and a shift towards competency-based learning.</p><h2>Infrastructure Requirements</h2><p>Implementing NEP 2020 requires significant changes to physical infrastructure, including activity rooms, maker spaces, and flexible classroom designs that support collaborative learning.</p><h2>Curriculum Changes</h2><p>Schools must adopt a 5+3+3+4 curricular structure and integrate coding, AI literacy, and life skills into the mainstream curriculum from an early age.</p><h2>How CampusMart Can Help</h2><p>We offer a complete range of NEP-compliant furniture, technology, and lab equipment to help institutions make a smooth transition. Our team of experts can assess your current setup and recommend the best solutions.</p>`, imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-01-10') },
        { title: 'Sustainable Campus Design', slug: 'sustainable-campus-design', excerpt: 'How to create eco-friendly educational spaces that inspire students and reduce environmental impact.', body: `<h2>Why Sustainability Matters in Education</h2><p>Educational institutions have a unique opportunity to model sustainable practices for students. A green campus not only reduces operational costs but also serves as a living laboratory for environmental education.</p><h2>Key Principles</h2><p>Sustainable campus design incorporates passive solar design, rainwater harvesting, solar energy, native landscaping, and sustainable building materials. These elements work together to create a campus that is comfortable, cost-effective, and environmentally responsible.</p><h2>Furniture and Materials</h2><p>Choosing furniture made from recycled materials, sustainably sourced wood, and low-VOC finishes contributes to healthier indoor environments and reduced environmental impact. CampusMart offers a wide range of eco-certified furniture options.</p>`, imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-01-05') },
        { title: 'Designing Collaborative Labs for the Modern Era', slug: 'designing-collaborative-labs', excerpt: 'Move beyond traditional front-facing setups with modular workbenches and shared learning stations.', body: `<h2>The Evolution of the Science Lab</h2><p>The days of static, heavy demonstration tables and bolted-down student desks are fading. Modern educational philosophies mandate that science is best learned through active group problem solving rather than isolated experimentation.</p><h2>Modular Approaches</h2><p>By implementing mobile gas fixtures, dropdown electrical tracks, and caster-mounted sinks, lab spaces can be reconfigured in minutes to shift from a biology lecture loop to a robotics competition arena.</p><h2>Safety without Compromise</h2><p>Safety remains paramount. Advanced downdraft tables and centralized kill-switches mean these modular setups are often more secure than their legacy counterparts.</p>`, imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-02-01') },
        { title: 'Integrating Active Acoustics in School Auditoriums', slug: 'active-acoustics-auditoriums', excerpt: 'How programmable sound deflection ensures every student can hear clearly, regardless of seating.', body: `<h2>Beyond Static Paneling</h2><p>While bass traps and foam wedges have their place, the modern auditorium demands more dynamic solutions. School spaces frequently shift between serving as drama theaters, examination halls, and concert venues.</p><h2>Programmable Sound Shaping</h2><p>Electro-acoustic enhancement systems use an array of microphones and speakers to dynamically alter the reverberation time of a room. At the push of a button on a control panel, a highly damped lecture space can transform into a resonant cathedral-like hall for the school choir.</p>`, imageUrl: 'https://images.unsplash.com/photo-1598016422731-50e561a069a5?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-02-14') },
        { title: 'The Role of Technology in Special Needs Education', slug: 'tech-special-needs-education', excerpt: 'Leveraging accessible hardware and adaptive software to create truly inclusive classrooms.', body: `<h2>Breaking Down Barriers</h2><p>Technology has the profound ability to level the playing field for students with diverse learning requirements. From text-to-speech software to specialized ergonomic input devices, the right tools foster independence and confidence.</p><h2>Adaptive Ergonomics</h2><p>We explore height-adjustable touch panels and sensory-friendly lighting systems that cater to neurodivergent students, reducing sensory overload while maximizing engagement.</p>`, imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-03-01') },
        { title: 'Data-Driven Campus Security', slug: 'data-driven-campus-security', excerpt: 'Moving from reactive security cameras to proactive access control and analytics.', body: `<h2>The New Standard in Safety</h2><p>Campus security is no longer just about hiring guards and installing cameras. Today\'s leading institutions use integrated RFID access, AI-powered crowd analytics, and automated lockdown protocols.</p><h2>Balancing Openness and Security</h2><p>The challenge for any educational institution is remaining welcoming to the community while ensuring student safety. Invisible security measures like biometric turnstiles and automated visitor management kiosks offer the perfect balance.</p>`, imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80', published: true, publishedAt: new Date('2025-03-08') }
    ];

    for (const post of posts) {
        await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: post });
    }

    console.log('✓ Products and Blog Posts seeded');

    // ── Pages ─────────────────────────────────────────────────────────────
    const corePages = [
        { slug: 'about-us', title: 'About Us', template: 'corporate' },
        { slug: 'ar-vr-learning', title: 'AR / VR Learning', template: 'home-feature-detail' },
        { slug: 'ai-digital-design-supply', title: 'AI/Digital Design & Supply', template: 'ai-digital-design-supply' },
        { slug: 'ai-guide', title: 'AI Guide', template: 'ai-guide' },
        { slug: 'ai-ml', title: 'AI & ML Labs', template: 'ai-ml' },
        { slug: 'ai-stations', title: 'AI-Powered Learning Stations', template: 'ai-stations' },
        { slug: 'assessment-system', title: 'Assessment System', template: 'assessment-system' },
        { slug: 'blog', title: 'Blog', template: 'blog' },
        { slug: 'campus-automation', title: 'Campus Automation', template: 'campus-automation' },
        { slug: 'campus-design-execution', title: 'Campus Design & Execution', template: 'campus-design-execution' },
        { slug: 'campus-design', title: 'Campus Design', template: 'campus-design' },
        { slug: 'catalogues', title: 'Catalogues', template: 'catalogues' },
        { slug: 'classifieds', title: 'Classifieds', template: 'classifieds' },
        { slug: 'colleges-universities-for-sale', title: 'Colleges / Universities for Sale', template: 'colleges-universities-for-sale' },
        { slug: 'collaboration', title: 'Collaboration Spaces', template: 'collaboration' },
        { slug: 'contact-us', title: 'Contact Us', template: 'contact-us' },
        { slug: 'corporate', title: 'Corporate Identity', template: 'corporate' },
        { slug: 'digital-transformation', title: 'Digital Transformation', template: 'digital-transformation' },
        { slug: 'furniture-design-supply', title: 'Furniture Design & Supply', template: 'furniture-design-supply' },
        { slug: 'furniture', title: 'Furniture Solutions', template: 'furniture' },
        { slug: 'innovation-centres', title: 'Innovation Centres', template: 'innovation-centres' },
        { slug: 'innovation', title: 'Innovation Ecosystems', template: 'innovation' },
        { slug: 'labs', title: 'Laboratories', template: 'labs' },
        { slug: 'libraries', title: 'Libraries', template: 'libraries' },
        { slug: 'library-management', title: 'Library Management', template: 'library-management' },
        { slug: 'lms', title: 'Learning Management System', template: 'lms' },
        { slug: 'smart-classrooms', title: 'Smart Classrooms', template: 'smart-classrooms' },
        { slug: 'lookbook', title: 'Lookbook', template: 'lookbook' },
        { slug: 'new-environments', title: 'New Learning Environments', template: 'new-environments' },
        { slug: 'partnership', title: 'Partnership', template: 'partnership' },
        { slug: 'payment-policy', title: 'Payment Policy', template: 'payment-policy' },
        { slug: 'privacy-policy', title: 'Privacy Policy', template: 'privacy-policy' },
        { slug: 'replacement-return', title: 'Replacement & Return Policy', template: 'replacement-return' },
        { slug: 'services', title: 'Our Services', template: 'services' },
        { slug: 'solutions', title: 'Functional Solutions', template: 'solutions' },
        { slug: 'setup-college', title: 'Setup Your College', template: 'setup-college' },
        { slug: 'shop', title: 'Shop', template: 'shop' },
        { slug: 'sports-design-execution', title: 'Sports Design & Execution', template: 'sports-design-execution' },
        { slug: 'sports-infra', title: 'Sports Infrastructure', template: 'sports-infra' },
        { slug: 'tech-infra', title: 'Tech Infrastructure', template: 'tech-infra' },
        { slug: 'terms-of-use', title: 'Terms of Use', template: 'terms-of-use' },
        { slug: 'ugc-guidelines', title: 'UGC Guidelines', template: 'ugc-guidelines' },
        { slug: 'product-catalog', title: 'Product Catalog', template: 'product-catalog' },
        { slug: 'lookbook', title: 'Lookbook', template: 'lookbook' },
        { slug: 'assessment-system', title: 'Assessment System', template: 'assessment-system' },
    ];

    for (const page of corePages) {
        const pageData = PAGE_DATA[page.slug];
        const existingPage = await prisma.page.findUnique({ where: { slug: page.slug } });
        let existingPageHasCards = false;
        try {
            const existingCards = existingPage?.pageData ? JSON.parse(existingPage.pageData).cards : undefined;
            existingPageHasCards = Array.isArray(existingCards) && existingCards.length > 0;
        } catch {
            existingPageHasCards = false;
        }
        const shouldSeedNewPageData = page.slug === 'colleges-universities-for-sale' && !existingPageHasCards;
        await prisma.page.upsert({
            where: { slug: page.slug },
            update: {
                template: page.template,
                published: true,
                ...(shouldSeedNewPageData && pageData ? { pageData: JSON.stringify(pageData) } : {}),
            },
            create: {
                title: page.title,
                slug: page.slug,
                template: page.template,
                published: true,
                content: '',
                pageData: pageData ? JSON.stringify(pageData) : '{}',
            },
        });
    }

    console.log(`✓ ${corePages.length} pages seeded with pageData`);

    // ── Mark System Bootstrapped ──────────────────────────────────────────
    await prisma.siteContent.upsert({
        where: { key: 'system_bootstrapped' },
        update: { value: 'true' },
        create: { key: 'system_bootstrapped', value: 'true' },
    });
    console.log('✓ System bootstrap flag marked as true');

    await prisma.$disconnect();
}

seed().catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
});
