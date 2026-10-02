const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const uploadsDir = path.resolve(__dirname, '../uploads');

async function audit() {
  const pages = await prisma.page.findMany();
  console.log('Total pages in DB:', pages.length);

  const brokenImages = [];
  const emptyPages = [];

  for (const page of pages) {
    if (!page.pageData || page.pageData.trim() === '' || page.pageData === '{}') {
      emptyPages.push(page.slug);
      continue;
    }

    const matches = page.pageData.match(/\/uploads\/[^\s"',]+/g) || [];
    for (const match of matches) {
      const rel = match.replace(/^\/uploads\//, '');
      const abs = path.join(uploadsDir, rel);
      if (!fs.existsSync(abs)) {
        brokenImages.push({ slug: page.slug, brokenPath: match });
      }
    }
  }

  console.log('Empty / unconfigured pages:', emptyPages);
  console.log('Total broken /uploads/ paths across all pages:', brokenImages.length);
  if (brokenImages.length > 0) {
    console.log(JSON.stringify(brokenImages, null, 2));
  }
}

audit()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
