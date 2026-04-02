import { PrismaClient } from "./src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const existingAdmin = await prisma.usuario.findFirst({ where: { isAdmin: true } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("41422006", 10);

    await prisma.usuario.create({
      data: {
        nome: "Administrador",
        email: "admin@laurasatelie.com",
        telefone: "",
        senha: hashedPassword,
        isAdmin: true,
      },
    });

    console.log("Admin user created");
  }

  const existingProducts = await prisma.produto.count();
  if (existingProducts === 0) {
    await prisma.produto.createMany({
      data: [
        {
          nome: "Ursinho Amigurumi",
          descricao: "Ursinho feito à mão em crochê, perfeito para presentear.",
          preco: 89.90,
          categoria: "pronta",
          imagemUrl: null,
          materiais: ["Fio de algodão", "Enchimento de fibra"],
          dimensoes: "25cm x 15cm",
        },
        {
          nome: "Bolsa de Crochê",
          descricao: "Bolsa elegante feita em crochê com acabamento premium.",
          preco: 129.90,
          categoria: "encomenda",
          imagemUrl: null,
          materiais: ["Fio de algodão", "Forro de tecido"],
          dimensoes: "30cm x 25cm x 10cm",
        },
      ],
    });

    console.log("Sample products created");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
