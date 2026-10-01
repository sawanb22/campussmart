process.env.VERCEL = '1';

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import jwt from 'jsonwebtoken';
import app from '../src/index';

const PORT = 3851;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('🧪 Starting End-to-End CMS & Content Integration Verification...\n');
  const server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // Generate admin token
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev';
    const adminToken = jwt.sign(
      { id: 16, email: 'admin@campussmart.in', role: 'admin', firstName: 'Admin', lastName: 'User' },
      secret,
      { expiresIn: '1h' }
    );

    // 1. Verify Site Content API serves updated keys
    console.log('--- 1. Testing Site Content API Pipeline ---');
    const contentRes = await fetch(`${BASE_URL}/api/content`);
    assert(contentRes.status === 200, 'GET /api/content returns 200 OK');
    const rawContentData: any = await contentRes.json();
    assert(typeof rawContentData === 'object', 'Site content payload is an object');

    // Parse data exactly as SiteContentProvider in frontend does:
    const parsedContent: Record<string, any> = {};
    for (const key in rawContentData) {
      try {
        parsedContent[key] = JSON.parse(rawContentData[key]);
      } catch {
        parsedContent[key] = rawContentData[key];
      }
    }
    
    // 2. Verify home_services in DB & API
    console.log('\n--- 2. Testing home_services Pipeline for ServiceCards ---');
    const servicesInApi = parsedContent.home_services;
    assert(Array.isArray(servicesInApi) && servicesInApi.length > 0, `home_services is populated array (count: ${servicesInApi?.length || 0})`);
    if (servicesInApi && servicesInApi.length > 0) {
      const firstService = servicesInApi[0];
      assert(typeof firstService.title === 'string' && !!firstService.title, `First service has title: "${firstService.title}"`);
      assert(typeof firstService.href === 'string' && !!firstService.href, `First service has href: "${firstService.href}"`);
      assert(typeof firstService.bgColor === 'string', `First service has bgColor: "${firstService.bgColor}"`);
    }

    // 3. Verify Contact Info keys in Site Content
    console.log('\n--- 3. Testing Contact Info Keys for TopBar and ContactUs ---');
    const contactPhone = parsedContent.contact_phone;
    const contactEmail = parsedContent.contact_email;
    assert(!!contactPhone, `contact_phone is present: "${contactPhone}"`);
    assert(!!contactEmail, `contact_email is present: "${contactEmail}"`);

    // 4. Verify Pages with and without templates
    console.log('\n--- 4. Testing Pages Pipeline & Dynamic Fallback ---');
    const pagesRes = await fetch(`${BASE_URL}/api/pages/published`);
    assert(pagesRes.status === 200, 'GET /api/pages/published returns 200 OK');
    const pages: any = await pagesRes.json();
    assert(Array.isArray(pages) && pages.length > 0, `Published pages count: ${pages.length}`);

    // Check digital-transformation page has pageData
    const dtPage = pages.find((p: any) => p.slug === 'digital-transformation');
    assert(!!dtPage, 'Page "digital-transformation" exists in published pages');
    if (dtPage) {
      const pageData = typeof dtPage.pageData === 'string' ? JSON.parse(dtPage.pageData) : dtPage.pageData;
      assert(!!pageData?.heroTitle, `digital-transformation has heroTitle: "${pageData?.heroTitle}"`);
    }

    // Check a page with no hardcoded template (e.g., assessment-system)
    const assessmentPage = pages.find((p: any) => p.slug === 'assessment-system');
    assert(!!assessmentPage, 'Page "assessment-system" exists in published pages');
    if (assessmentPage) {
      const pageData = typeof assessmentPage.pageData === 'string' ? JSON.parse(assessmentPage.pageData) : assessmentPage.pageData;
      assert(!!pageData, 'assessment-system has structured pageData ready for GenericPageRenderer');
    }

    // 5. Test Creating a Custom Dynamic Page with structured blocks
    console.log('\n--- 5. Testing Dynamic CMS Page Creation & Data Integrity ---');
    const testSlug = `custom-cms-test-${Date.now()}`;
    const customPagePayload = {
      heroLabel: 'Custom Welcome',
      heroTitle: 'Custom Dynamic Page Title',
      heroSubtitle: 'Testing GenericPageRenderer without any .tsx template',
      cards: [
        { title: 'Block 1', description: 'Testing block 1 description', category: 'Testing' },
        { title: 'Block 2', description: 'Testing block 2 description', category: 'Testing' },
      ],
      sections: [
        { heading: 'Deep Dive Section', body: 'Detailed description inside section', bullets: ['Feature A', 'Feature B'] }
      ]
    };

    const createRes = await fetch(`${BASE_URL}/api/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Custom Dynamic Page Test',
        slug: testSlug,
        template: '',
        published: true,
        pageData: customPagePayload,
      }),
    });

    assert(createRes.status === 201, `POST /api/pages created test page with status 201`);
    const createdPage: any = await createRes.json();

    // Verify retrieving it via public API
    const singlePageRes = await fetch(`${BASE_URL}/api/pages/${testSlug}`);
    assert(singlePageRes.status === 200, `GET /api/pages/${testSlug} returned 200 OK`);
    const fetchedPage: any = await singlePageRes.json();
    const retrievedData = typeof fetchedPage.pageData === 'string' 
      ? JSON.parse(fetchedPage.pageData) 
      : fetchedPage.pageData;
    assert(retrievedData.heroTitle === 'Custom Dynamic Page Title', 'heroTitle matches saved payload');
    assert(retrievedData.cards?.length === 2, '2 cards retrieved in pageData');
    assert(retrievedData.sections?.length === 1, '1 section retrieved in pageData');

    // Clean up test page
    const deleteRes = await fetch(`${BASE_URL}/api/pages/${createdPage.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteRes.status === 204, `Cleaned up custom test page ID ${createdPage.id} (status 204)`);

    console.log(`\n==========================================`);
    console.log(`CMS Integration Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==========================================\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err: any) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
}

main();
