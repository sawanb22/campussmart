import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const prisma = new PrismaClient();

async function genToken() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!user) {
      console.error('No admin user found!');
      return;
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1y' }
    );
    console.log('ADMIN_TOKEN=' + token);
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

genToken();
