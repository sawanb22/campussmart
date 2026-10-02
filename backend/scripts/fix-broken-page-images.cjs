const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const REPLACEMENTS = [
  {
    oldPattern: /https:\/\/images\.unsplash\.com\/photo-1505693416388-[^"'\s]+/g,
    newUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldPattern: /https:\/\/images\.unsplash\.com\/photo-1581093458791-[^"'\s]+/g,
    newUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldPattern: /https:\/\/images\.unsplash\.com\/photo-1622163642998-[^"'\s]+/g,
    newUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldPattern: /https:\/\/images\.unsplash\.com\/photo-1461896836934-voices[^"'\s]*/g,
    newUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    oldPattern: /https:\/\/images\.unsplash\.com\/photo-1516321318423-[^"'\s]+/g,
    newUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
  }
];

async function main() {
  console.log('Fixing broken image URLs in PostgreSQL database...');
  const pages = await prisma.page.findMany();
  let updatedCount = 0;

  for (const page of pages) {
    if (!page.pageData) continue;
    let dataStr = typeof page.pageData === 'string' ? page.pageData : JSON.stringify(page.pageData);
    let changed = false;

    for (const r of REPLACEMENTS) {
      if (r.oldPattern.test(dataStr)) {
        dataStr = dataStr.replace(r.oldPattern, r.newUrl);
        changed = true;
      }
    }

    if (changed) {
      await prisma.page.update({
        where: { id: page.id },
        data: { pageData: dataStr }
      });
      console.log(`Updated page /${page.slug} in DB`);
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} pages in database.`);

  // Update in code files if found
  const filesToUpdate = [
    path.resolve(__dirname, '../../src/admin/pageDefaults.ts'),
    path.resolve(__dirname, '../../src/pages/sports-infra.tsx'),
    path.resolve(__dirname, '../../src/pages/furniture.tsx'),
    path.resolve(__dirname, '../../src/pages/labs.tsx'),
    path.resolve(__dirname, '../../src/pages/ugc-guidelines.tsx')
  ];

  for (const f of filesToUpdate) {
    if (fs.existsSync(f)) {
      let content = fs.readFileSync(f, 'utf-8');
      let changed = false;
      for (const r of REPLACEMENTS) {
        if (r.oldPattern.test(content)) {
          content = content.replace(r.oldPattern, r.newUrl);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(f, content, 'utf-8');
        console.log(`Updated code file: ${f}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
