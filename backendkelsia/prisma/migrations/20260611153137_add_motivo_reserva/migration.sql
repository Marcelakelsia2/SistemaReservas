-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "alteradoPorId" INTEGER,
ADD COLUMN     "motivoCancelamento" TEXT,
ADD COLUMN     "motivoEdicao" TEXT;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_alteradoPorId_fkey" FOREIGN KEY ("alteradoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
