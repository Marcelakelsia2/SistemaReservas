/*
  Warnings:

  - Changed the type of `horaInicio` on the `reservas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `horaFim` on the `reservas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `horaFim` on the `reservas_equipamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `horaInicio` on the `reservas_equipamentos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "reservas" DROP COLUMN "horaInicio",
ADD COLUMN     "horaInicio" TIMESTAMP(3) NOT NULL,
DROP COLUMN "horaFim",
ADD COLUMN     "horaFim" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reservas_equipamentos" DROP COLUMN "horaFim",
ADD COLUMN     "horaFim" TIMESTAMP(3) NOT NULL,
DROP COLUMN "horaInicio",
ADD COLUMN     "horaInicio" TIMESTAMP(3) NOT NULL;
