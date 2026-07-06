/*
  Warnings:

  - You are about to drop the column `quantidadeDisponivel` on the `equipamentos` table. All the data in the column will be lost.
  - You are about to drop the `notificacoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notificacoes" DROP CONSTRAINT "notificacoes_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "notificacoes" DROP CONSTRAINT "notificacoes_usuarioId_fkey";

-- AlterTable
ALTER TABLE "equipamentos" DROP COLUMN "quantidadeDisponivel";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "refreshToken" TEXT;

-- DropTable
DROP TABLE "notificacoes";
