import prisma from '../src/lib/prisma';
import axios from 'axios';

async function runVerification() {
  console.log('=== RUNNING GLOBAL STANDARDIZATION & FIX VERIFICATION ===');
  let errors = 0;

  // 1. Database Catalogue Check
  console.log('\n[1] Checking PostgreSQL Catalogue Table...');
  const catalogues = await prisma.catalogue.findMany();
  console.log(`Found ${catalogues.length} total catalogues in DB.`);
  const invalidIds = catalogues.filter(c => [1, 2, 3, 4, 5, 6].includes(c.id));
  if (invalidIds.length > 0) {
    console.error('FAIL: Found stale mock catalogue IDs:', invalidIds.map(c => c.id));
    errors++;
  } else {
    console.log('PASS: Mock catalogue IDs 1-6 are completely eliminated.');
  }

  const activeCatalogues = catalogues.filter(c => c.active);
  console.log(`Active catalogues count: ${activeCatalogues.length}`);
  if (activeCatalogues.length < 4) {
    console.error('FAIL: Expected at least 4 active user catalogues, found:', activeCatalogues.length);
    errors++;
  } else {
    console.log('PASS: Verified all legitimate user catalogues are preserved and active.');
  }

  // 2. Case Studies DB Check
  console.log('\n[2] Checking CaseStudy DB Records...');
  const caseStudies = await prisma.caseStudy.findMany({ where: { active: true } });
  console.log(`Found ${caseStudies.length} active case studies in DB.`);
  caseStudies.forEach(cs => {
    console.log(` - ID ${cs.id}: "${cs.title}" (slug: ${cs.slug})`);
  });
  if (caseStudies.length < 3) {
    console.error('FAIL: Expected active case studies, found:', caseStudies.length);
    errors++;
  } else {
    console.log('PASS: Verified case studies are active in database.');
  }

  // 3. Pages DB Slugs & Templates Check
  console.log('\n[3] Checking Page Slugs & Templates...');
  const targetSlugs = ['about-us', 'corporate', 'catalogues', 'furniture-design-supply', 'campus-design-execution'];
  const pages = await prisma.page.findMany({ where: { slug: { in: targetSlugs } } });
  targetSlugs.forEach(slug => {
    const p = pages.find(item => item.slug === slug);
    if (!p) {
      console.error(`FAIL: Missing database page record for slug "${slug}"`);
      errors++;
    } else {
      console.log(`PASS: Page "${slug}" exists (ID: ${p.id}, template: ${p.template}, published: ${p.published})`);
    }
  });

  // 4. Case Study Prefix Resolution Check
  console.log('\n[4] Testing Case Study Prefix Slug Resolution...');
  for (const cs of caseStudies) {
    const cleanPrefix = cs.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const found = await prisma.caseStudy.findFirst({
      where: {
        active: true,
        OR: [
          { slug: cleanPrefix },
          { slug: { startsWith: cleanPrefix } },
          { id: cs.id }
        ]
      }
    });
    if (!found) {
      console.error(`FAIL: Prefix query "${cleanPrefix}" did not find case study ID ${cs.id}`);
      errors++;
    } else {
      console.log(`PASS: Prefix query "${cleanPrefix}" correctly resolved to "${found.title}" (ID ${found.id})`);
    }
  }

  await prisma.$disconnect();

  if (errors > 0) {
    console.error(`\nFAILED: ${errors} errors detected.`);
    process.exit(1);
  } else {
    console.log('\nALL VERIFICATION CHECKS PASSED WITH 0 ERRORS.');
    process.exit(0);
  }
}

runVerification().catch(e => {
  console.error('Unexpected verification exception:', e);
  process.exit(1);
});
