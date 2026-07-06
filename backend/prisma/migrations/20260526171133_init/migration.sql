/*
  Warnings:

  - A unique constraint covering the columns `[telefone]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `horaFimFuncionamento` to the `salas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaInicioFuncionamento` to the `salas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'FUNCIONARIO';

-- AlterTable
ALTER TABLE "notificacoes" ADD COLUMN     "lidaEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "salas" ADD COLUMN     "horaFimFuncionamento" TEXT NOT NULL,
ADD COLUMN     "horaInicioFuncionamento" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "codigoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "codigoRecuperacao" TEXT,
ADD COLUMN     "codigoRecuperacaoExpiraEm" TIMESTAMP(3),
ADD COLUMN     "codigoVerificacao" TEXT,
ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telefone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" INTEGER,
    "descricao" TEXT,
    "usuarioId" INTEGER,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficheiros" (
    "id" SERIAL NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "nomeFicheiro" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "usuarioId" INTEGER,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ficheiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefone_key" ON "usuarios"("telefone");

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
