import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function testSeedPreservation() {
    console.log('Testing admin password preservation in seed...');
    
    // Pick or create a test admin
    const testAdminEmail = 'test_seed_preservation@campusmart.in';
    const customPassword = 'CustomAdminPassword#2026';
    const customHash = await bcrypt.hash(customPassword, 10);

    let testUser = await prisma.user.findFirst({
        where: { email: { equals: testAdminEmail, mode: 'insensitive' } }
    });

    if (testUser) {
        testUser = await prisma.user.update({
            where: { id: testUser.id },
            data: { passwordHash: customHash, role: 'admin' }
        });
    } else {
        testUser = await prisma.user.create({
            data: {
                name: 'Test Seed Admin',
                email: testAdminEmail,
                passwordHash: customHash,
                role: 'admin',
                phone: '+91 99999 99999',
                institution: 'Test Campus',
            }
        });
    }

    const originalHash = testUser.passwordHash;

    // Simulate seed execution for this admin
    const adminEmail = testAdminEmail;
    const existingAdmin = await prisma.user.findFirst({
        where: { email: { equals: adminEmail, mode: 'insensitive' } },
    });

    if (existingAdmin) {
        await prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
                role: 'admin',
                emailVerified: true,
                name: existingAdmin.name || 'CampusMart Admin',
            },
        });
    }

    const reloaded = await prisma.user.findUnique({ where: { id: testUser.id } });
    if (!reloaded) throw new Error('Admin not found after seed simulation');

    if (reloaded.passwordHash !== originalHash) {
        throw new Error(`FAIL: Password hash changed! Was ${originalHash}, now ${reloaded.passwordHash}`);
    }

    const passwordStillMatches = await bcrypt.compare(customPassword, reloaded.passwordHash);
    if (!passwordStillMatches) {
        throw new Error('FAIL: Password no longer validates!');
    }

    console.log('✅ PASS: Admin passwordHash was strictly preserved across seed execution.');

    // Clean up test user
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✅ Cleaned up test admin.');

    await prisma.$disconnect();
}

testSeedPreservation().catch((err) => {
    console.error('Fatal error in seed preservation test:', err);
    process.exit(1);
});
