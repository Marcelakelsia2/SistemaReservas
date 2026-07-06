-- AlterTable
ALTER TABLE "reservas_equipamentos" ADD COLUMN     "alteradoPorId" INTEGER,
ADD COLUMN     "motivoCancelamento" TEXT,
ADD COLUMN     "motivoEdicao" TEXT;

-- AddForeignKey
ALTER TABLE "reservas_equipamentos" ADD CONSTRAINT "reservas_equipamentos_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
