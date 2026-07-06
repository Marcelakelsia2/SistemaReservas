/*
  Warnings:

  - You are about to drop the column `reservaId` on the `reservas_equipamentos` table. All the data in the column will be lost.
  - Added the required column `data` to the `reservas_equipamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaFim` to the `reservas_equipamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaInicio` to the `reservas_equipamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `reservas_equipamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `reservas_equipamentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "reservas_equipamentos" DROP CONSTRAINT "reservas_equipamentos_reservaId_fkey";

-- AlterTable
ALTER TABLE "reservas_equipamentos" DROP COLUMN "reservaId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "horaFim" TEXT NOT NULL,
ADD COLUMN     "horaInicio" TEXT NOT NULL,
ADD COLUMN     "status" "StatusReserva" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "reservas_equipamentos" ADD CONSTRAINT "reservas_equipamentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
