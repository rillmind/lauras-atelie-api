/*
  Warnings:

  - You are about to drop the column `imagem` on the `Produto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produto" DROP COLUMN "imagem",
ADD COLUMN     "imagemUrl" TEXT;
