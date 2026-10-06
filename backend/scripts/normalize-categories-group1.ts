import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Group 1 Database Category Normalization ---');

  // 1. Merge Duplicate Sports Category (ID 51 -> ID 3)
  const cat3 = await prisma.category.findUnique({ where: { id: 3 } });
  const cat51 = await prisma.category.findUnique({ where: { id: 51 } });

  if (cat51) {
    console.log('Found duplicate category 51 (sports). Reassigning products to category 3...');
    const updatedProducts = await prisma.product.updateMany({
      where: { categoryId: 51 },
      data: { categoryId: 3 },
    });
    console.log(`Reassigned ${updatedProducts.count} products from category 51 to category 3.`);

    await prisma.category.delete({ where: { id: 51 } });
    console.log('Deleted duplicate category 51.');
  } else {
    console.log('Category 51 already cleaned up.');
  }

  // 2. Fix Technology Category Page Association (ID 4: page furniture -> tech-infra)
  const cat4 = await prisma.category.findUnique({ where: { id: 4 } });
  if (cat4 && cat4.page !== 'tech-infra') {
    console.log('Updating category 4 (Technology) page from furniture to tech-infra...');
    await prisma.category.update({
      where: { id: 4 },
      data: { page: 'tech-infra', slug: 'tech-infra', name: 'Technology Infrastructure' },
    });
    console.log('Category 4 updated to tech-infra.');
  }

  // 3. Ensure Furniture Subcategories Exist
  const chairsCat = await prisma.category.upsert({
    where: { slug: 'chairs' },
    update: { page: 'furniture', name: 'Chairs & Seating' },
    create: { name: 'Chairs & Seating', slug: 'chairs', page: 'furniture' },
  });
  console.log(`Chairs category verified: ID ${chairsCat.id}`);

  const desksCat = await prisma.category.upsert({
    where: { slug: 'desks' },
    update: { page: 'furniture', name: 'Desks & Tables' },
    create: { name: 'Desks & Tables', slug: 'desks', page: 'furniture' },
  });
  console.log(`Desks category verified: ID ${desksCat.id}`);

  const storageCat = await prisma.category.upsert({
    where: { slug: 'storage' },
    update: { page: 'furniture', name: 'Storage & Fixtures' },
    create: { name: 'Storage & Fixtures', slug: 'storage', page: 'furniture' },
  });
  console.log(`Storage category verified: ID ${storageCat.id}`);

  // 4. Distribute existing furniture products into chairs, desks, storage
  const deskProductIds = [1, 9, 18]; // Smart Classroom Desk, Collaborative Hexagon Table, Modular Makerspace Stations
  const chairProductIds = [7, 19];   // Ergonomic Teacher Chair, chairrss
  const storageProductIds = [15];    // Acoustic Wall Panels

  await prisma.product.updateMany({
    where: { id: { in: deskProductIds } },
    data: { categoryId: desksCat.id },
  });
  await prisma.product.updateMany({
    where: { id: { in: chairProductIds } },
    data: { categoryId: chairsCat.id },
  });
  await prisma.product.updateMany({
    where: { id: { in: storageProductIds } },
    data: { categoryId: storageCat.id },
  });
  console.log('Distributed furniture products into chairs, desks, storage.');

  // 5. Ensure AI/ML Categories Exist
  const aiRoboticsCat = await prisma.category.upsert({
    where: { slug: 'ai-robotics' },
    update: { page: 'ai-ml', name: 'AI & Robotics Kits' },
    create: { name: 'AI & Robotics Kits', slug: 'ai-robotics', page: 'ai-ml' },
  });
  console.log(`AI Robotics category verified: ID ${aiRoboticsCat.id}`);

  const visionLabsCat = await prisma.category.upsert({
    where: { slug: 'vision-labs' },
    update: { page: 'ai-ml', name: 'Vision & Language Labs' },
    create: { name: 'Vision & Language Labs', slug: 'vision-labs', page: 'ai-ml' },
  });
  console.log(`Vision Labs category verified: ID ${visionLabsCat.id}`);

  // Summary
  const allCategories = await prisma.category.findMany({
    include: { _count: { select: { product: true } } },
    orderBy: [{ page: 'asc' }, { name: 'asc' }],
  });
  console.log('\n--- Final Category Distribution ---');
  allCategories.forEach((c) => {
    console.log(`[Page: ${c.page}] ID: ${c.id} | Slug: ${c.slug} | Name: ${c.name} (${c._count.product} products)`);
  });
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
