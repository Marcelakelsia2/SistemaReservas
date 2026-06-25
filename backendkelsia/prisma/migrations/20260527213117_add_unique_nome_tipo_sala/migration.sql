/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `salas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `tipos_sala` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "salas_nome_key" ON "salas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_sala_nome_key" ON "tipos_sala"("nome");
