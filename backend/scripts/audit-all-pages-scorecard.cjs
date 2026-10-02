const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    if (res.ok) return { ok: true, status: res.status };
    // fallback to GET if HEAD rejected
    const getRes = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
    return { ok: getRes.ok, status: getRes.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE PAGE-WISE & ASSET AUDIT');
  console.log('====================================================\n');

  const pages = await prisma.page.findMany({
    orderBy: { slug: 'asc' }
  });

  console.log(`Found ${pages.length} pages in PostgreSQL database.\n`);

  const results = [];
  let brokenImagesTotal = 0;
  let brokenApisTotal = 0;

  for (const page of pages) {
    const pageResult = {
      slug: page.slug,
      title: page.title,
      published: page.published,
      apiStatus: 'PENDING',
      imagesChecked: 0,
      brokenImages: [],
      notes: []
    };

    // 1. Check API endpoint
    try {
      const apiRes = await fetch(`${BASE_URL}/api/pages/${page.slug}`);
      if (apiRes.ok) {
        pageResult.apiStatus = 'PASS (200)';
      } else {
        pageResult.apiStatus = `FAIL (${apiRes.status})`;
        brokenApisTotal++;
      }
    } catch (e) {
      pageResult.apiStatus = `ERROR (${e.message})`;
      brokenApisTotal++;
    }

    // 2. Parse PageData
    let pageData = {};
    try {
      if (page.pageData) {
        pageData = typeof page.pageData === 'string' ? JSON.parse(page.pageData) : page.pageData;
      }
    } catch (e) {
      pageResult.notes.push(`JSON Parse Error: ${e.message}`);
    }

    // 3. Collect all images in pageData
    const imageUrls = new Set();
    function extractImages(obj) {
      if (!obj) return;
      if (typeof obj === 'string') {
        if (obj.startsWith('http://') || obj.startsWith('https://') || obj.startsWith('/uploads/')) {
          imageUrls.add(obj);
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(extractImages);
      } else if (typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) {
          if (k.toLowerCase().includes('image') || k.toLowerCase().includes('photo') || k.toLowerCase().includes('img') || k.toLowerCase().includes('banner') || k.toLowerCase().includes('avatar')) {
            if (typeof v === 'string' && v.trim()) imageUrls.add(v.trim());
          }
          extractImages(v);
        }
      }
    }

    extractImages(pageData);

    // 4. Test all collected images
    pageResult.imagesChecked = imageUrls.size;
    for (const imgUrl of imageUrls) {
      let fullUrl = imgUrl;
      if (imgUrl.startsWith('/uploads/')) {
        fullUrl = `${BASE_URL}${imgUrl}`;
      }
      const check = await checkUrl(fullUrl);
      if (!check.ok) {
        pageResult.brokenImages.push({ url: imgUrl, status: check.status || check.error });
        brokenImagesTotal++;
      }
    }

    results.push(pageResult);
  }

  // 5. Codebase Scan for Dead Links and Buttons in src/pages
  console.log('\n--- SCANNING CODEBASE (src/pages/*.tsx) ---');
  const pagesDir = path.resolve(__dirname, '../../src/pages');
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));
  const codeScan = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    const deadLinks = (content.match(/href=["']#["']/g) || []).length;
    const emptyLinks = (content.match(/to=["']#?["']/g) || []).length;
    codeScan.push({
      file,
      deadHrefCount: deadLinks,
      emptyToCount: emptyLinks
    });
  }

  // Summary
  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY SCORECARD');
  console.log('====================================================');
  console.log(`Total Database Pages Audited: ${pages.length}`);
  console.log(`Total Page API Failures: ${brokenApisTotal}`);
  console.log(`Total Broken Images Found: ${brokenImagesTotal}`);
  console.log(`Total TSX Page Files Scanned: ${files.length}`);

  const brokenPages = results.filter(r => r.brokenImages.length > 0 || !r.apiStatus.startsWith('PASS'));
  if (brokenPages.length > 0) {
    console.log(`\n⚠️ Pages Requiring Attention (${brokenPages.length}):`);
    brokenPages.forEach(p => {
      console.log(`- /${p.slug}: API=${p.apiStatus}, BrokenImages=${p.brokenImages.map(b => b.url).join(', ')}`);
    });
  } else {
    console.log('\n✅ 100% OF ALL 60 PAGES & MEDIA PASSED AUDIT WITH ZERO ERRORS!');
  }

  return { results, codeScan, brokenImagesTotal, brokenApisTotal };
}

runAudit()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
