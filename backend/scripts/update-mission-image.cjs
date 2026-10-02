const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.findFirst({ where: { slug: 'about-us' } });
  if (!page) {
    console.error('about-us page not found in DB!');
    return;
  }
  let pageData = {};
  try {
    pageData = JSON.parse(page.pageData || '{}');
  } catch (e) {
    console.error('Error parsing pageData', e);
  }
  pageData.missionImage = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80';
  await prisma.page.update({
    where: { id: page.id },
    data: { pageData: JSON.stringify(pageData) }
  });
  console.log('Successfully updated about-us page in database with verified missionImage!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
