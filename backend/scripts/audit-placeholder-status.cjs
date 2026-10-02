const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('====================================================');
  console.log('📊 CONTENT TEAM PUBLISHING & MEDIA AUDIT TRACKER');
  console.log('====================================================\n');

  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' } });
  let localCount = 0;
  let placeholderCount = 0;

  const report = [];

  for (const page of pages) {
    const raw = page.pageData || '';
    const hasLocal = raw.includes('/uploads/');
    const hasUnsplash = raw.includes('images.unsplash.com');

    if (hasLocal && !hasUnsplash) {
      localCount++;
      report.push({ slug: page.slug, status: '✅ 100% Real Disk Media' });
    } else if (hasLocal && hasUnsplash) {
      report.push({ slug: page.slug, status: '🔄 Mixed (Disk Media + Some Placeholders)' });
    } else if (hasUnsplash) {
      placeholderCount++;
      report.push({ slug: page.slug, status: '📸 Unsplash Placeholders (Ready for Content Team)' });
    } else {
      report.push({ slug: page.slug, status: 'ℹ️ Text-only / No Images' });
    }
  }

  console.log(`Total Pages Analyzed: ${pages.length}`);
  console.log(`Pages with Live Placeholders (Ready to Replace): ${placeholderCount}`);
  console.log(`Pages with Local Disk Uploads: ${localCount}\n`);

  console.log('Detailed Page Breakdown:');
  report.forEach(r => {
    console.log(`  - /${r.slug.padEnd(35)} : ${r.status}`);
  });

  console.log('\n💡 As your content team uploads real media in the Admin panel (/admin/pages),');
  console.log('   the placeholders will be replaced with real disk files automatically!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
