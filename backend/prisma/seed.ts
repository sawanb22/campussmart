import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 600, name = 'operation'): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const message = err?.message || '';
            const isLockError = message.includes('Lock wait timeout exceeded');
            console.warn(`⚠️ Retry ${attempt + 1}/${retries} for ${name}: ${message}`);
            if (!isLockError || attempt === retries) break;
            await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
    }
    throw lastError;
}

async function main() {
    console.log('🌱 Seeding database...');

    // Admin user
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@campusmart.in';
    const existingAdmin = await prisma.user.findFirst({
        where: { email: { equals: adminEmail, mode: 'insensitive' } },
    });

    if (existingAdmin) {
        await withRetry(() => prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
                role: 'admin',
                emailVerified: true,
                name: existingAdmin.name || 'CampusMart Admin',
            },
        }));
        console.log(`✓ Admin user verified: ${adminEmail} (existing credentials preserved)`);
    } else {
        const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@1234';
        const adminHash = await bcrypt.hash(initialPassword, 10);
        await withRetry(() => prisma.user.create({
            data: {
                name: 'CampusMart Admin',
                email: adminEmail,
                passwordHash: adminHash,
                role: 'admin',
                emailVerified: true,
                phone: '+91 98765 00000',
                institution: 'CampusMart',
            },
        }));
        console.log(`✓ Initial admin user created: ${adminEmail}`);
    }

    // Demo user
    const userHash = await bcrypt.hash('User@1234', 10);
    await withRetry(() => prisma.user.upsert({
        where: { email: 'user@campussmart.in' },
        update: { emailVerified: true, role: 'user' },
        create: {
            name: 'Demo Campus User',
            email: 'user@campussmart.in',
            passwordHash: userHash,
            role: 'user',
            emailVerified: true,
            phone: '+91 98765 11111',
            institution: 'Sample University',
        },
    }));

    // Categories
    const categories = [
        { name: 'Furniture', slug: 'furniture', page: 'furniture' },
        { name: 'Lab Equipment', slug: 'labs', page: 'labs' },
        { name: 'Sports', slug: 'sports', page: 'sports' },
        { name: 'Technology', slug: 'technology', page: 'furniture' },
        { name: 'Library', slug: 'library', page: 'libraries' },
    ];
    for (const cat of categories) {
        await withRetry(() => prisma.category.upsert({
            where: { slug: cat.slug },
            update: { page: cat.page },
            create: cat,
        }));
    }

    const catMap = await prisma.category.findMany();
    const catBySlug = Object.fromEntries(catMap.map((c) => [c.slug, c.id]));

    // Products
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
        await withRetry(() => prisma.product.upsert({
            where: { slug: rest.slug },
            update: {},
            create: { ...rest, categoryId: catBySlug[categorySlug] },
        }));
    }

    // Blog posts
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
        await withRetry(() => prisma.blogPost.upsert({
            where: { slug: post.slug },
            update: {},
            create: post,
        }));
    }

    // Catalogues
    const catalogues = [
        { title: 'Furniture Catalogue 2025', description: 'Complete range of school and college furniture solutions', fileUrl: '/uploads/catalogues/furniture-2025.pdf', thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&q=80' },
        { title: 'Lab Equipment Catalogue', description: 'State-of-the-art laboratory setup and equipment', fileUrl: '/uploads/catalogues/lab-equipment.pdf', thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=300&q=80' },
        { title: 'Technology Solutions Catalogue', description: 'Smart classroom and digital learning solutions', fileUrl: '/uploads/catalogues/technology.pdf', thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80' },
    ];

    for (const cat of catalogues) {
        await withRetry(() => prisma.catalogue.create({ data: cat }));
    }

    // Default site content
    const siteContent = [
        { key: 'hero_title', value: 'Transforming Campus Infrastructure' },
        { key: 'hero_subtitle', value: 'Your trusted partner for creating world-class educational environments. From furniture to technology, we deliver complete campus solutions.' },
        { key: 'about_text', value: 'CampusMart is India\'s leading provider of educational infrastructure solutions, serving 500+ institutions across the country.' },
        { key: 'contact_phone', value: '+91 98765 43210' },
        { key: 'contact_email', value: 'info@campusmart.in' },
        { key: 'contact_address', value: '123, Tech Park, Whitefield, Bangalore, Karnataka - 560066' },
    ];

    for (const content of siteContent) {
        await withRetry(() => prisma.siteContent.upsert({
            where: { key: content.key },
            update: {},
            create: content,
        }));
    }

    // Pages (CMS)
    const pages = [
        { title: 'Home', slug: 'home' },
        { title: 'About Us', slug: 'about-us' },
        { title: 'Corporate', slug: 'corporate' },
        { title: 'Contact Us', slug: 'contact-us' },
        { title: 'Blog', slug: 'blog' },
        { title: 'Shop', slug: 'shop' },
        { title: 'Services', slug: 'services' },
        { title: 'Solutions', slug: 'solutions' },
        { title: 'Catalogues', slug: 'catalogues' },
        { title: 'Classifieds', slug: 'classifieds' },
        { title: 'Colleges / Universities for Sale', slug: 'colleges-universities-for-sale' },
        { title: 'AI Digital Design Supply', slug: 'ai-digital-design-supply' },
        { title: 'AI Guide', slug: 'ai-guide' },
        { title: 'AI & ML', slug: 'ai-ml' },
        { title: 'AI Stations', slug: 'ai-stations' },
        { title: 'Assessment System', slug: 'assessment-system' },
        { title: 'Campus Automation', slug: 'campus-automation' },
        { title: 'Campus Design Execution', slug: 'campus-design-execution' },
        { title: 'Campus Design', slug: 'campus-design' },
        { title: 'Collaboration', slug: 'collaboration' },
        { title: 'Digital Transformation', slug: 'digital-transformation' },
        { title: 'Furniture Design Supply', slug: 'furniture-design-supply' },
        { title: 'Furniture', slug: 'furniture' },
        { title: 'Innovation Centres', slug: 'innovation-centres' },
        { title: 'Innovation', slug: 'innovation' },
        { title: 'Labs', slug: 'labs' },
        { title: 'Libraries', slug: 'libraries' },
        { title: 'Library Products', slug: 'library-products' },
        { title: 'Library Management', slug: 'library-management' },
        { title: 'Learning Management System', slug: 'lms' },
        { title: 'Lookbook', slug: 'lookbook' },
        { title: 'New Environments', slug: 'new-environments' },
        { title: 'Partnership', slug: 'partnership' },
        { title: 'Privacy Policy', slug: 'privacy-policy' },
        { title: 'Product Catalog', slug: 'product-catalog' },
        { title: 'Request Quote', slug: 'request-quote' },
        { title: 'Setup College', slug: 'setup-college' },
        { title: 'Sports Design Execution', slug: 'sports-design-execution' },
        { title: 'Sports Infrastructure', slug: 'sports-infra' },
        { title: 'Sports Products', slug: 'sports-products' },
        { title: 'Tech Infrastructure', slug: 'tech-infra' },
        { title: 'Terms of Use', slug: 'terms-of-use' },
        { title: 'UGC Guidelines', slug: 'ugc-guidelines' },
        { title: 'Payment Policy', slug: 'payment-policy' },
        { title: 'Order Rejection', slug: 'order-rejection' },
        { title: 'Replacement & Return', slug: 'replacement-return' },
        { title: 'My Account', slug: 'my-account' },
        { title: 'Login', slug: 'login' },
        { title: 'Registration', slug: 'registration' },
        { title: 'Lab Products', slug: 'lab-products' },
    ];

    for (const page of pages) {
        await withRetry(() => prisma.page.upsert({
            where: { slug: page.slug },
            update: {
                title: page.title,
                template: page.slug,
                published: true,
            },
            create: {
                title: page.title,
                slug: page.slug,
                template: page.slug,
                pageData: '{}',
                published: true,
            },
        }));
    }

    console.log('✅ Database seeded successfully!');
    console.log(`📧 Admin seeded: ${adminEmail}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
