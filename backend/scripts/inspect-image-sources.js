const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, imageUrl: true }
  });

  let prodExternal = 0, prodLocal = 0, prodEmpty = 0;
  const externalDomains = {};

  for (const pr of products) {
    if (!pr.imageUrl) {
      prodEmpty++;
    } else if (pr.imageUrl.startsWith('http://') || pr.imageUrl.startsWith('https://')) {
      prodExternal++;
      try {
        const u = new URL(pr.imageUrl);
        externalDomains[u.hostname] = (externalDomains[u.hostname] || 0) + 1;
      } catch (e) {}
    } else if (pr.imageUrl.startsWith('/uploads')) {
      prodLocal++;
    }
  }

  console.log(`=== PRODUCTS (${products.length} total) ===`);
  console.log(`External CDN URLs: ${prodExternal}`);
  console.log(`Local /uploads/... paths: ${prodLocal}`);
  console.log(`Empty / Null: ${prodEmpty}`);
  console.log('External domains breakdown:', externalDomains);

  const pages = await prisma.page.findMany({
    select: { slug: true, pageData: true }
  });

  let pageExternal = 0, pageLocal = 0;
  const pageDomains = {};
  const sampleLocal = [];

  for (const pg of pages) {
    if (!pg.pageData) continue;
    const urls = pg.pageData.match(/(https?:\/\/[^\s"',]+|\/uploads\/[^\s"',]+)/g) || [];
    for (const u of urls) {
      if (u.startsWith('http://') || u.startsWith('https://')) {
        pageExternal++;
        try {
          const parsed = new URL(u);
          pageDomains[parsed.hostname] = (pageDomains[parsed.hostname] || 0) + 1;
        } catch (e) {}
      } else if (u.startsWith('/uploads')) {
        pageLocal++;
        if (sampleLocal.length < 5) sampleLocal.push({ slug: pg.slug, url: u });
      }
    }
  }

  console.log(`\n=== PAGES (${pages.length} total) ===`);
  console.log(`External CDN URLs in pageData: ${pageExternal}`);
  console.log(`Local /uploads/... paths in pageData: ${pageLocal}`);
  console.log('Page External domains breakdown:', pageDomains);
  console.log('Sample local paths in pages:', sampleLocal);
}

inspect()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
