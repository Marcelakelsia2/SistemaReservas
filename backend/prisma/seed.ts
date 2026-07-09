import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("Admin@12345", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@sistema.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@sistema.com",
      telefone: "900000000",
      senha: senhaHash,
      role: Role.ADMIN,
      ativo: true,
      emailVerificado: true,
    },
  });

 
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });