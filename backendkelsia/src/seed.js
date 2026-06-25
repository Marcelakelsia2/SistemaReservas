// src/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL!;

  // Verifica se já existe
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('✅ Admin já existe, seed ignorado.');
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10);

  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME!,
      email,
      password: hashedPassword,
      role: 'ADMIN', // ajusta ao teu enum/string
    },
  });

  console.log('✅ Admin criado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });