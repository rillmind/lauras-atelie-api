import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProdutoDto } from "./dto/create-produto.dto";
import { UpdateProdutoDto } from "./dto/update-produto.dto";

function extractFilename(url: string | null): string | null {
  if (!url) return null;
  if (!url.includes("supabase.co")) return url;
  const match = url.match(/product-icons\/([^?]+)/);
  return match ? match[1].split("?")[0] : null;
}

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto });
  }

  async findAll() {
    const produtos = await this.prisma.produto.findMany();
    return produtos.map((p) => ({
      ...p,
      imagemUrl: p.imagemUrl ? extractFilename(p.imagemUrl) : null,
    }));
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });
    if (!produto) throw new NotFoundException(`Produto #${id} não encontrado`);
    return {
      ...produto,
      imagemUrl: produto.imagemUrl ? extractFilename(produto.imagemUrl) : null,
    };
  }

  async update(id: number, dto: UpdateProdutoDto) {
    await this.findOne(id);
    return this.prisma.produto.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.produto.delete({ where: { id } });
  }
}
