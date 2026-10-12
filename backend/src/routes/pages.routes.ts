import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { uploadDocument } from '../middleware/upload.middleware';

const router = Router();

const COLLEGE_SALE_SLUG = 'colleges-universities-for-sale';
const COLLEGE_SALE_DATA = {
    heroTitle: 'Businesses for Sale and Investment',
    heroSubtitle: 'Showing businesses for sale and investment. Buy or invest in a business listed by direct business owners and business brokers.',
    filterLabel: 'cbse schools',
    cards: [
        { title: 'School for Sale in Bahraich, India', description: 'CBSE school with 800+ students, day and boarding facility for sale in Bahraich. The school encompasses a total area of 87,000 square feet and includes approximately 40 rooms, fully equipped science and computer labs.', location: 'Bahraich', rating: '6.8', sales: 'INR 2.6 crore', margin: '40 %', askingPrice: 'INR 20 Cr', premium: true, image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80' },
        { title: 'Playschool Seeking Loan in Haryana, India', description: 'Education society in Haryana with 5 CBSE schools and 70 playschools. This is an educational society with primary and play schools seeking growth funding.', location: 'Haryana', rating: '6.8', sales: 'INR 30 crore', margin: '25 %', askingPrice: 'INR 5 Cr at 15%', premium: true, image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=80' },
        { title: 'School for Sale in Thiruvananthapuram, India', description: 'CBSE-affiliated school with 400+ students and owned facilities. Located in Thiruvananthapuram, this school offers quality education from a well-established campus.', location: 'Thiruvananthapuram', rating: '6.2', sales: 'INR 1.6 crore', margin: '10 - 20 %', askingPrice: 'INR 8 Cr', image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=700&q=80' },
    ],
};

async function ensureCollegeSalePage() {
    const existing = await prisma.page.findUnique({ where: { slug: COLLEGE_SALE_SLUG } });
    if (existing) return existing;
    return prisma.page.create({
        data: {
            title: 'Colleges / Universities for Sale',
            slug: COLLEGE_SALE_SLUG,
            template: COLLEGE_SALE_SLUG,
            published: true,
            pageData: JSON.stringify(COLLEGE_SALE_DATA),
        },
    });
}

const PARTNER_SLUG = 'partner-with-colleges';
const JOB_OPENINGS_SLUG = 'job-openings';

// Makes sure the "Partner With Running Colleges" page (linked from the Classifieds
// "Partnership Opportunities" card) always has a DB row so it shows up in the admin
// Pages Manager. Its full default content lives in the React component / pageDefaults.ts
// and is used as a fallback for any field this row doesn't override.
async function ensurePartnerPage() {
    const existing = await prisma.page.findUnique({ where: { slug: PARTNER_SLUG } });
    if (existing) return existing;
    return prisma.page.create({
        data: {
            title: 'Partner With Running Colleges',
            slug: PARTNER_SLUG,
            template: PARTNER_SLUG,
            published: true,
            pageData: JSON.stringify({}),
        },
    });
}

async function ensureJobOpeningsPage() {
    const existing = await prisma.page.findUnique({ where: { slug: JOB_OPENINGS_SLUG } });
    if (existing) return existing;
    return prisma.page.create({
        data: {
            title: 'Job Openings',
            slug: JOB_OPENINGS_SLUG,
            template: JOB_OPENINGS_SLUG,
            published: true,
            pageData: JSON.stringify({}),
        },
    });
}

async function restorePartnershipIdentity() {
    const existing = await prisma.page.findUnique({ where: { slug: 'partnership' } });
    if (existing) return existing;
    return prisma.page.create({
        data: {
            title: 'Partnership Enquiry',
            slug: 'partnership',
            template: 'partnership',
            published: true,
            pageData: JSON.stringify({}),
        },
    });
}

const INITIAL_SEED_DATA: Record<string, Record<string, any>> = {
    'faq': {
        heroEyebrow: 'Support & Guidance',
        heroTitle: 'Frequently Asked Questions',
        heroSubtitle: 'Find answers to common questions about our campus infrastructure solutions, smart classroom technologies, UGC/NEP compliance, and turnkey procurement.',
        searchPlaceholder: 'Search by keywords (e.g. UGC, furniture, quote, classrooms)...',
        ctaEyebrow: 'Direct Assistance',
        ctaTitle: 'Still have unanswered questions?',
        ctaSubtitle: 'Our educational infrastructure consultants are available to provide custom walkthroughs, budget estimations, and architectural assessments for your institution.',
        ctaBadge1: 'Free Initial Assessment',
        ctaBadge2: '24-48h Response Time',
        ctaButtonLabel: 'Contact Our Team',
        ctaHref: '/contact-us',
        contact_phone: '+91 9966109191',
        contact_email: 'info@campusmart.in',
        hideHero: false,
        hideFaqs: false,
        hideCta: false,
        faqs: [
            {
                question: 'What turnkey infrastructure and technology services does CampusMart offer?',
                answer: 'CampusMart provides end-to-end infrastructure and technology solutions for schools, colleges, and universities. Our capabilities encompass campus master planning, ergonomic classroom and laboratory furniture, AI-powered smart classrooms, STEM and science labs, athletic sports infrastructure, and unified digital campus automation.',
                active: true,
            },
            {
                question: 'Can CampusMart upgrade or retrofit existing campuses, or is it strictly for new builds?',
                answer: 'We cater to both new greenfield campus setups and existing institutions. Our specialists provide phased modular retrofitting to modernize traditional lecture halls, legacy computer labs, and libraries into digital-first environments with minimal disruption to ongoing academic operations.',
                active: true,
            },
            {
                question: 'Are CampusMart’s smart infrastructure solutions compliant with UGC and NEP 2020 guidelines?',
                answer: 'Yes. All our digital learning frameworks, smart classroom technologies, laboratory setups, and campus designs are meticulously planned in alignment with UGC norms and National Education Policy (NEP 2020) standards to ensure seamless institutional compliance and accreditation.',
                active: true,
            },
            {
                question: 'How does CampusMart manage project execution, quality assurance, and warranties?',
                answer: 'Every project is led by a dedicated project engineer and procurement manager. We manage end-to-end delivery—from 3D layout simulation and OEM manufacturing to on-site installation and testing. All hardware, digital systems, and custom furniture include comprehensive OEM warranties and post-installation support.',
                active: true,
            },
            {
                question: 'How can our institution request a campus consultation or customized quote?',
                answer: "You can submit an enquiry using the partnership form below, email us at info@campusmart.in, or call our advisory team directly at +91 9966109191. Our campus consultants will analyze your institution's specific needs and provide a tailored proposal within 24 to 48 hours.",
                active: true,
            },
        ],
    },
    'how-it-works': {
        heroEyebrow: 'Platform Guide · Campus Procurement & Execution',
        heroTitle: 'How CampusMart Works: From Campus Vision to Turnkey Reality',
        heroSubtitle: 'A step-by-step editorial guide to how educational institutions plan, procure, and execute world-class campus infrastructure, smart classrooms, and laboratories through CampusMart.',
        heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85',
        author: 'CampusMart Editorial Team',
        readTime: '5 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Discovery & Institutional Needs Assessment',
                body: 'Every campus project begins with understanding your academic goals, student capacity, spatial constraints, and regulatory requirements (UGC, AICTE, or CBSE/IB norms). Whether you are setting up a greenfield university or upgrading a single laboratory block, our specialists audit your floor plans and workflows before recommending a single product.',
                bullets: [
                    'Complimentary consultation with campus architects and education technology specialists',
                    'Alignment with NEP 2020 and statutory accreditation requirements',
                    'Spatial zoning and capacity planning tailored to student headcount',
                ],
                active: true,
            },
            {
                heading: '2. Spatial Design, 3D Visualization & Product Curation',
                body: 'Once the scope is defined, our design studio translates your requirements into detailed 2D layouts, 3D walkthroughs, and curated bills of quantities (BOQs). Instead of dealing with dozens of fragmented vendors, you select from vetted global and Indian brands across furniture, labs, sports, and digital infrastructure in one unified catalogue.',
                bullets: [
                    'Ergonomic classroom, library, and hostel furniture mapped to room dimensions',
                    'Turnkey STEM, AI/ML, and science laboratory equipment specifications',
                    'Transparent, consolidated quotation with OEM-backed warranties',
                ],
                active: true,
            },
            {
                heading: '3. Coordinated Manufacturing, Delivery & On-Site Execution',
                body: 'A dedicated CampusMart project engineer oversees manufacturing timelines, logistics, civil/MEP readiness, and on-site installation. Every shipment is sequenced against your campus construction or academic calendar so rooms are handed over ready for classes.',
                bullets: [
                    'Single point of accountability from factory dispatch to classroom installation',
                    'Rigorous quality checks and safety compliance testing on site',
                    'Phased delivery schedules designed to avoid academic disruption',
                ],
                active: true,
            },
            {
                heading: '4. Faculty Enablement & Lifecycle Support',
                body: 'Handover is just the beginning. We train faculty and lab technicians on interactive displays, AI learning stations, and lab apparatus, backed by responsive post-installation maintenance and warranty support across India.',
                bullets: [
                    'Hands-on faculty onboarding and technical documentation',
                    'Direct OEM warranty coverage and preventive maintenance support',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Start Your Campus Journey',
        ctaTitle: 'Ready to plan or upgrade your campus?',
        ctaSubtitle: 'Speak with our campus planning and procurement specialists for a tailored assessment and project roadmap.',
        ctaButtonLabel: 'Request a Quote',
        ctaHref: '/request-quote',
    },
    'brand-help': {
        heroEyebrow: 'Brand & Product Support · Help Centre',
        heroTitle: 'Brand Help: Navigating Global Educational Brands, Warranties & Specifications',
        heroSubtitle: 'Everything institutional buyers and partner brands need to know about product authenticity, technical specifications, OEM warranties, and after-sales service on CampusMart.',
        heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
        author: 'CampusMart Brand Advisory',
        readTime: '4 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Curated Consortium of Certified Educational Brands',
                body: 'CampusMart partners directly with leading global and domestic manufacturers across interactive technology, ergonomic campus furniture, scientific instrumentation, and tournament-grade sports surfacing. Every brand listed on our platform undergoes strict evaluation for institutional durability, safety certifications, and long-term serviceability.',
                bullets: [
                    '100% authorized OEM sourcing with verified factory certifications',
                    'BIFMA, ISO, and federation-compliant infrastructure standards',
                    'Direct technical specification sheets and CAD blocks for institutional architects',
                ],
                active: true,
            },
            {
                heading: '2. Product Demonstrations & Sample Evaluations',
                body: 'Selecting infrastructure for hundreds or thousands of students requires confidence in build quality. Our Brand Help desk coordinates live virtual or on-campus product demonstrations, material finish samples, and reference site visits so your procurement committee can evaluate products firsthand.',
                bullets: [
                    'Live hardware demos for interactive flat panels, AI stations, and LMS suites',
                    'Material swatches and prototype samples for classroom and hostel furniture',
                    'Comparative brand suitability guidance based on budget and usage intensity',
                ],
                active: true,
            },
            {
                heading: '3. Unified OEM Warranty & After-Sales Service',
                body: 'Instead of chasing multiple manufacturers for service requests, CampusMart provides a centralized Brand Help desk. Whether you need calibration for laboratory instruments, firmware support for smart boards, or replacement parts for seating, our team coordinates directly with the brand’s engineering wing.',
                bullets: [
                    'Single-window warranty registration and service ticket resolution',
                    'Preventive maintenance schedules and AMC packages for campus hardware',
                    'Dedicated brand escalation support for institutional accounts',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Brand Assistance Desk',
        ctaTitle: 'Need help with a specific brand, specification, or warranty?',
        ctaSubtitle: 'Reach out to our Brand Help specialists for technical datasheets, product comparisons, or service support.',
        ctaButtonLabel: 'Contact Brand Support',
        ctaHref: '/contact-us',
    },
    'sell-on-campusmart': {
        heroEyebrow: 'Seller & OEM Guide · Partner Ecosystem',
        heroTitle: 'Sell on CampusMart: Reach 4,000+ Schools, Colleges & Universities Across India',
        heroSubtitle: 'A comprehensive guide for educational furniture manufacturers, edtech innovators, laboratory equipment OEMs, and sports infrastructure providers looking to distribute through India’s premier campus consortium.',
        heroImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85',
        author: 'CampusMart Partner Network',
        readTime: '6 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Why Leading Education Brands Sell on CampusMart',
                body: 'Educational procurement in India is uniquely relationship-driven and specification-led. CampusMart bridges the gap between high-quality manufacturers and institutional decision-makers—connecting your products directly with K-12 school chains, private universities, engineering colleges, and turnkey campus master planners.',
                bullets: [
                    'Direct visibility among chancellors, principals, trustees, and campus architects',
                    'Inclusion in turnkey institutional BOQs and greenfield campus projects',
                    'Dedicated digital catalogue showcase and category placement',
                ],
                active: true,
            },
            {
                heading: '2. Categories We Onboard',
                body: 'We welcome established OEMs, authorized national distributors, and innovative edtech companies whose products meet institutional-grade quality and safety benchmarks across core campus verticals.',
                bullets: [
                    'Campus Furniture: Classroom seating, libraries, hostels, cafeterias, and modular labs',
                    'Smart Classroom & EdTech: Interactive displays, AI learning stations, AR/VR, and LMS platforms',
                    'Science, STEM & Engineering Labs: Physics, chemistry, biology, robotics, and compute labs',
                    'Sports & Outdoor Infrastructure: Synthetic courts, turf, aquatic systems, and play zones',
                ],
                active: true,
            },
            {
                heading: '3. Onboarding Process & Quality Benchmarks',
                body: 'Becoming a verified CampusMart seller is a structured four-step process designed to uphold institutional trust and ensure seamless order fulfillment.',
                bullets: [
                    'Step 1 — Submit your vendor profile, product catalogue, and compliance certifications',
                    'Step 2 — Quality, pricing, and warranty review by our category procurement specialists',
                    'Step 3 — Digital catalogue onboarding and mapping to CampusMart solution verticals',
                    'Step 4 — Active participation in institutional enquiries, RFQs, and turnkey projects',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Become a Verified Seller',
        ctaTitle: 'Ready to showcase your products to 4,000+ campuses?',
        ctaSubtitle: 'Submit your brand and product portfolio to our vendor onboarding team to start selling on CampusMart.',
        ctaButtonLabel: 'Apply as a Seller / Partner',
        ctaHref: '/partnership',
    },
    '20-stunning-college-buildings': {
        heroEyebrow: 'Architectural Showcase · Campus Masterpieces',
        heroTitle: '20 Stunning College Buildings Transforming Campus Architecture',
        heroSubtitle: 'A curated exploration of visionary educational architecture—where daylight, sustainability, ergonomic learning zones, and structural ingenuity converge.',
        heroImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=85',
        author: 'CampusMart Architectural Desk',
        readTime: '6 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Sustainable Biophilic Academic Hubs',
                body: 'Contemporary campus architecture integrates natural ecosystems directly into learning spaces. These institutions feature living green walls, passive ventilation chimneys, and natural timber frameworks that lower embodied carbon while sharpening student focus and cognitive wellbeing.',
                bullets: [
                    'Over 60% reduction in artificial lighting needs through deep daylight harvesting',
                    'Biophilic courtyards acting as informal study and seminar breakout lounges',
                    'LEED Platinum and GRIHA 5-Star environmental benchmarks across major facilities',
                ],
                active: true,
            },
            {
                heading: '2. Light-Filled Atriums & Interdisciplinary Pods',
                body: 'Gone are the dark, monolithic double-loaded corridors of legacy institutions. Visionary college buildings feature multi-storey soaring atriums with acoustic baffling, sculptural stairways, and floating collaboration pods where cross-faculty serendipity thrives.',
                bullets: [
                    'Acoustically isolated study pods nested within active common areas',
                    'Grand central stairways designed to promote active movement and interaction',
                    'Flexible exhibition zones for student engineering and design showcases',
                ],
                active: true,
            },
            {
                heading: '3. Net-Zero Engineering & Smart Dynamic Facades',
                body: 'Leading university structures act as living laboratories. Kinetic louvers follow sun angles to eliminate thermal glare, while building management sensors regulate ventilation rates in real-time according to indoor air quality and room occupancy.',
                bullets: [
                    'Smart solar skin generating on-site renewable power for classroom AV equipment',
                    'Real-time IoT dashboards displaying energy and water consumption in student concourses',
                    'Rainwater harvesting cascades integrated into external landscape aesthetics',
                ],
                active: true,
            },
            {
                heading: '4. Heritage Preservation Meets High-Tech Modernism',
                body: 'The most stunning campuses masterfully blend historical stone and masonry heritage with ultra-modern glass, steel, and interactive technology. Sensitive structural retrofits give centuries-old halls brand new life as state-of-the-art hybrid lecture studios.',
                bullets: [
                    'Restoration of historic exterior envelopes paired with high-performance MEP interiors',
                    'Concealed cable trays and discrete climate control protecting historic ceilings',
                    'Sympathetic glass connectors linking traditional buildings with new digital wings',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Design Your Campus',
        ctaTitle: 'Ready to build an iconic campus building?',
        ctaSubtitle: 'Collaborate with our campus planning and architectural engineering team to bring world-class design standards to your institution.',
        ctaButtonLabel: 'Consult With Architects',
        ctaHref: '/request-quote',
    },
    'academic-buildings': {
        heroEyebrow: 'Spatial Planning · Academic Excellence',
        heroTitle: 'Academic Buildings: Designing High-Performance Learning Environments',
        heroSubtitle: 'How modern universities and schools configure flexible lecture halls, tiered seminar rooms, and collaboration corridors to maximize academic engagement.',
        heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85',
        author: 'Campus Planning Advisory',
        readTime: '5 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Modular Lecture Halls & Flexible Seating',
                body: 'Traditional fixed-row lecture halls are evolving into dynamic, active learning classrooms. Tiered collaborative tables and 360-degree swivel seating allow students to switch seamlessly from lecture mode to team problem-solving within seconds.',
                bullets: [
                    'Ergonomic, high-density lecture furniture with built-in device charging ports',
                    'Sightline optimization ensuring unobstructed views of digital interactive boards',
                    'Modular partition walls allowing one large auditorium to divide into two seminar rooms',
                ],
                active: true,
            },
            {
                heading: '2. Acoustic Engineering & Natural Daylighting',
                body: 'High background noise and reverberation degrade comprehension and tire educators. Purpose-built academic buildings utilize acoustic wall panels, micro-perforated ceiling tiles, and indirect LED lighting to ensure exceptional speech clarity throughout the room.',
                bullets: [
                    'Reverberation time (RT60) calibrated between 0.6 and 0.8 seconds for optimal vocal clarity',
                    'Diffused north-facing daylight windows to minimize screen glare and eye fatigue',
                    'Silent displacement ventilation systems with low NC (Noise Criterion) ratings',
                ],
                active: true,
            },
            {
                heading: '3. Integrated EdTech & Smart Display Infrastructure',
                body: 'World-class academic buildings combine architectural acoustics with enterprise-grade teaching technology. Dual interactive panels, automated lecturer-tracking PTZ cameras, and ceiling beamforming microphones make blended hybrid education effortless.',
                bullets: [
                    'Zero-latency wireless screen sharing for faculty and student laptops',
                    'Dual 86-inch 4K interactive displays with anti-glare toughened glass',
                    'Centralized IoT room automation for lighting, climate, and display switching',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Academic Facility Planning',
        ctaTitle: 'Planning new academic blocks or lecture wings?',
        ctaSubtitle: 'Request tailored layouts, BOQs, and equipment curation tailored to institutional headcount and statutory guidelines.',
        ctaButtonLabel: 'Request Facility Plan',
        ctaHref: '/request-quote',
    },
    'research-facilities': {
        heroEyebrow: 'Discovery & Innovation · Research Infrastructure',
        heroTitle: 'Advanced Research Facilities: Building Labs for Next-Generation Discoveries',
        heroSubtitle: 'Vibration control, cleanroom containment, and advanced utility zoning for university research hubs, STEM institutes, and incubation centres.',
        heroImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=85',
        author: 'CampusMart Lab Infrastructure Team',
        readTime: '5 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Wet & Dry Lab Zoning Standards',
                body: 'High-caliber research requires rigorous separation of computational dry labs and chemical or biological wet labs. CampusMart designs modular lab casework with chemical-resistant surfaces, under-bench services, and customizable utility drops.',
                bullets: [
                    'Epoxy and phenolic resin worktops resistant to corrosive reagents and heat',
                    'Flexible ceiling-mounted service distribution for gases, vacuum, and DI water',
                    'Vibration-isolated slabs (VC-D and VC-E criteria) for electron microscopy and lasers',
                ],
                active: true,
            },
            {
                heading: '2. HVAC, Fume Extraction & Safety Protocols',
                body: 'Safety is paramount in research environments. Our engineering wing specifies VAV (Variable Air Volume) fume hoods, hazardous gas sensing systems, emergency eye-wash/shower stations, and dedicated pressurized airlocks for biosafety level compliance.',
                bullets: [
                    'Energy-efficient VAV fume hoods reducing conditioned air exhaust by up to 50%',
                    'Continuous negative-pressure containment in biological isolation suites',
                    'Comprehensive chemical storage cabinets meeting OSHA and NFPA standards',
                ],
                active: true,
            },
            {
                heading: '3. Incubation Centres & Industry Research Suites',
                body: 'Universities are increasingly partnering with industry for funded R&D. We build modular incubation pods featuring secure access, dedicated server connectivity, conference lounges, and rapid prototype fabrication workshops.',
                bullets: [
                    'Turnkey maker spaces with CNC routers, 3D printers, and electronics benches',
                    'High-speed fiber connectivity and high-performance computing (HPC) rack spaces',
                    'Flexible lease spaces that reconfigure as research startup teams expand',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Turnkey Lab Solutions',
        ctaTitle: 'Planning an advanced research centre or testing facility?',
        ctaSubtitle: 'Our specialized laboratory planners ensure compliance with international safety, ventilation, and statutory utility specifications.',
        ctaButtonLabel: 'Consult Lab Specialists',
        ctaHref: '/contact-us',
    },
    'student-life-centers': {
        heroEyebrow: 'Campus Community · Student Wellness',
        heroTitle: 'Student Life Centers: Cultivating Thriving, Connected Campuses',
        heroSubtitle: 'Designing holistic campus hubs that unite dining, student unions, wellness centers, recreational zones, and creative makerspaces under one vibrant roof.',
        heroImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
        author: 'Student Life & Campus Experience Desk',
        readTime: '4 min read',
        hideHero: false,
        hideImage: false,
        hideContent: false,
        hideCta: false,
        sections: [
            {
                heading: '1. Multi-Functional Gathering Spaces & Student Lounges',
                body: 'Student life centers are the beating heart of campus culture outside classroom hours. Flexible open spaces equipped with soft modular seating, mobile whiteboards, and quiet study nooks give students an inviting third place to relax and collaborate.',
                bullets: [
                    'Durable, stain-resistant commercial upholstery designed for continuous daily use',
                    'Integrated power points and USB hubs embedded into booth seating and sofas',
                    'Acoustic ceiling baffles that buffer noise without enclosing the space',
                ],
                active: true,
            },
            {
                heading: '2. Modern Dining Halls & Social Cafeterias',
                body: 'Campus dining has evolved from institutional mess halls to modern food halls offering diverse cuisines. Ergonomic benching, booth alcoves, and indoor-outdoor dining terraces create welcoming atmospheres that encourage community building.',
                bullets: [
                    'High-capacity cafeteria furniture with easy-clean laminate finishes and powder-coated steel',
                    'Zoned seating offering quiet corners for solo dining and large tables for student groups',
                    'Waste sorting and sustainable food preparation infrastructure',
                ],
                active: true,
            },
            {
                heading: '3. Wellness, Fitness & Recreational Amenities',
                body: 'Comprehensive student centers integrate mind and body wellness. Facilities include indoor fitness centers with shock-absorbent athletic flooring, mental wellness counselling rooms, gaming lounges, and multipurpose rooms for club meetings and cultural performances.',
                bullets: [
                    'Multi-sport indoor courts and fitness studios with commercial rubber gym flooring',
                    'Soundproofed music practice pods and student government conference rooms',
                    'Private, welcoming student counselling and advisory suites',
                ],
                active: true,
            },
        ],
        ctaEyebrow: 'Enrich Student Experience',
        ctaTitle: 'Transform your student experience with a modern life center',
        ctaSubtitle: 'Work with our campus lifestyle architects to design spaces students love to study, socialize, and thrive in.',
        ctaButtonLabel: 'Start Planning',
        ctaHref: '/request-quote',
    },
};

async function ensureSimplePage(slug: string, title: string) {
    const seedPayload = INITIAL_SEED_DATA[slug];
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
        if (seedPayload && (!existing.pageData || existing.pageData === '{}')) {
            return prisma.page.update({
                where: { id: existing.id },
                data: {
                    published: true,
                    pageData: JSON.stringify(seedPayload),
                },
            });
        }
        return existing;
    }
    return prisma.page.create({
        data: {
            title,
            slug,
            template: slug,
            published: true,
            pageData: JSON.stringify(seedPayload || {}),
        },
    });
}

// GET /api/pages - get all pages (admin only to see unpublished)
router.get('/', verifyToken, requireAdmin, async (_req: AuthRequest, res: Response) => {
    try {
        await ensureCollegeSalePage();
        await ensurePartnerPage();
        await ensureJobOpeningsPage();
        await restorePartnershipIdentity();
        await ensureSimplePage('science-tech-labs', 'Science & Tech Labs');
        await ensureSimplePage('campus-master-planning', 'Campus Master Planning');
        await ensureSimplePage('ar-vr-experiences', 'AR / VR Learning');
        await ensureSimplePage('campus-furniture-design', 'Campus Furniture Design');
        await ensureSimplePage('collaboration-spaces', 'Collaboration Spaces');
        await ensureSimplePage('contact-us', 'Contact Us');
        await ensureSimplePage('catalogues', 'Catalogues & Downloads');
        await ensureSimplePage('faq', 'Frequently Asked Questions');
        await ensureSimplePage('how-it-works', 'How It Works');
        await ensureSimplePage('brand-help', 'Brand Help');
        await ensureSimplePage('sell-on-campusmart', 'Sell on CampusMart');
        await ensureSimplePage('20-stunning-college-buildings', '20 Stunning College Buildings');
        await ensureSimplePage('academic-buildings', 'Academic Buildings');
        await ensureSimplePage('research-facilities', 'Research Facilities');
        await ensureSimplePage('student-life-centers', 'Student Life Centers');
        await ensureSimplePage('home', 'Homepage');
        const pages = await prisma.page.findMany({
            orderBy: { title: 'asc' }
        });
        console.log(`Admin ${_req.user?.id} fetched ${pages.length} pages`);
        res.json(pages);
    } catch (error) {
        console.error('Failed to fetch pages:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// GET /api/pages/published - get all published pages (public)
router.get('/published', async (req: Request, res: Response) => {
    try {
        await ensureSimplePage('faq', 'Frequently Asked Questions');
        await ensureSimplePage('how-it-works', 'How It Works');
        await ensureSimplePage('brand-help', 'Brand Help');
        await ensureSimplePage('sell-on-campusmart', 'Sell on CampusMart');
        await ensureSimplePage('20-stunning-college-buildings', '20 Stunning College Buildings');
        await ensureSimplePage('academic-buildings', 'Academic Buildings');
        await ensureSimplePage('research-facilities', 'Research Facilities');
        await ensureSimplePage('student-life-centers', 'Student Life Centers');
        const pages = await prisma.page.findMany({
            where: { published: true }
        });
        res.json(pages);
    } catch {
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// GET /api/pages/:idOrSlug - get specific page by ID (number) or slug (string)
router.get('/:idOrSlug', async (req: Request, res: Response) => {
    try {
        const param = req.params.idOrSlug as string;
        const normalizedParam = param === 'sports' ? 'sports-infra' : param;
        const numericId = parseInt(normalizedParam);
        const isNumeric = !isNaN(numericId) && String(numericId) === normalizedParam;

        if (!isNumeric && normalizedParam === COLLEGE_SALE_SLUG) {
            return res.json(await ensureCollegeSalePage());
        }
        if (!isNumeric && normalizedParam === 'catalogues') {
            return res.json(await ensureSimplePage('catalogues', 'Catalogues & Downloads'));
        }
        if (!isNumeric && normalizedParam === 'faq') {
            return res.json(await ensureSimplePage('faq', 'Frequently Asked Questions'));
        }
        if (!isNumeric && normalizedParam === 'how-it-works') {
            return res.json(await ensureSimplePage('how-it-works', 'How It Works'));
        }
        if (!isNumeric && normalizedParam === 'brand-help') {
            return res.json(await ensureSimplePage('brand-help', 'Brand Help'));
        }
        if (!isNumeric && normalizedParam === 'sell-on-campusmart') {
            return res.json(await ensureSimplePage('sell-on-campusmart', 'Sell on CampusMart'));
        }
        if (!isNumeric && normalizedParam === '20-stunning-college-buildings') {
            return res.json(await ensureSimplePage('20-stunning-college-buildings', '20 Stunning College Buildings'));
        }
        if (!isNumeric && normalizedParam === 'academic-buildings') {
            return res.json(await ensureSimplePage('academic-buildings', 'Academic Buildings'));
        }
        if (!isNumeric && normalizedParam === 'research-facilities') {
            return res.json(await ensureSimplePage('research-facilities', 'Research Facilities'));
        }
        if (!isNumeric && normalizedParam === 'student-life-centers') {
            return res.json(await ensureSimplePage('student-life-centers', 'Student Life Centers'));
        }
        if (!isNumeric && normalizedParam === 'home') {
            return res.json(await ensureSimplePage('home', 'Homepage'));
        }

        const page = isNumeric
            ? await prisma.page.findUnique({ where: { id: numericId } })
            : await prisma.page.findUnique({ where: { slug: normalizedParam } });

        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        if (INITIAL_SEED_DATA[page.slug] && (!page.pageData || page.pageData === '{}')) {
            return res.json(await ensureSimplePage(page.slug, page.title));
        }
        res.json(page);
    } catch {
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// POST /api/pages/upload-document - upload a PDF (e.g. NDA, Mandate) and get back its URL (admin)
router.post('/upload-document', verifyToken, requireAdmin, uploadDocument.single('file'), (req: AuthRequest, res: Response) => {
    if (!req.file) {
        res.status(400).json({ error: 'A PDF file is required' });
        return;
    }
    res.status(201).json({ url: `/uploads/documents/${req.file.filename}` });
});

// POST /api/pages - create a page
router.post('/', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        // Validate required fields
        if (!req.body.title || !req.body.slug) {
            res.status(400).json({ error: 'Title and slug are required' });
            return;
        }

        const validFields: Array<'title' | 'slug' | 'content' | 'template' | 'pageData' | 'published'> = [
            'title', 'slug', 'content', 'template', 'pageData', 'published'
        ];
        const createData: Record<string, any> = {
            published: true,
        };

        for (const field of validFields) {
            if (req.body[field] !== undefined) {
                if (field === 'pageData' && typeof req.body.pageData === 'object' && req.body.pageData !== null) {
                    createData.pageData = JSON.stringify(req.body.pageData);
                } else if (field === 'published' && typeof req.body.published !== 'boolean') {
                    createData.published = req.body.published === 'true' || req.body.published === 1;
                } else {
                    createData[field] = req.body[field];
                }
            }
        }

        const page = await prisma.page.create({
            data: createData as any
        });
        console.log(`Page created by admin ${req.user?.id}: ${page.slug}`);
        res.status(201).json(page);
    } catch (error) {
        console.error('Failed to create page:', error);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// PUT /api/pages/:id - update a page
router.put('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        
        // Validate ID
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid page ID' });
            return;
        }

        // Check page exists before attempting update
        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Page not found' });
            return;
        }

        const validFields: Array<'title' | 'slug' | 'content' | 'template' | 'pageData' | 'published'> = [
            'title', 'slug', 'content', 'template', 'pageData', 'published'
        ];
        const updateData: Record<string, any> = {
            updatedAt: new Date()
        };

        for (const field of validFields) {
            if (req.body[field] !== undefined) {
                if (field === 'pageData' && typeof req.body.pageData === 'object' && req.body.pageData !== null) {
                    updateData.pageData = JSON.stringify(req.body.pageData);
                } else if (field === 'published' && typeof req.body.published !== 'boolean') {
                    updateData.published = req.body.published === 'true' || req.body.published === 1;
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        // Update page
        const page = await prisma.page.update({
            where: { id },
            data: updateData
        });
        
        console.log(`Page ${id} updated by admin ${req.user?.id}`);
        res.json(page);
    } catch (error) {
        console.error(`Failed to update page ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// DELETE /api/pages/:id - delete a page
router.delete('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        
        // Validate ID
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid page ID' });
            return;
        }

        // Check page exists before attempting delete
        const existing = await prisma.page.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Page not found' });
            return;
        }

        await prisma.page.delete({
            where: { id }
        });
        console.log(`Page ${id} deleted by admin ${req.user?.id}`);
        res.status(204).end();
    } catch (error) {
        console.error(`Failed to delete page ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

export default router;
