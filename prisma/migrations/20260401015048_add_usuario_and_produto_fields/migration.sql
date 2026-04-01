-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "categoria" TEXT NOT NULL DEFAULT 'pronta',
ADD COLUMN     "dimensoes" TEXT,
ADD COLUMN     "imagem" TEXT,
ADD COLUMN     "materiais" TEXT[];

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);
