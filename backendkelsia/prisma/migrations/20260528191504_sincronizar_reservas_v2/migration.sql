/*
  Warnings:

  - You are about to drop the `auditoria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ficheiros` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auditoria" DROP CONSTRAINT "auditoria_usuarioId_fkey";

-- DropTable
DROP TABLE "auditoria";

-- DropTable
DROP TABLE "ficheiros";
