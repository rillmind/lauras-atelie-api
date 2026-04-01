import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    const data = { ...dto };
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }
    return this.prisma.usuario.create({ data });
  }

  findAll() {
    return this.prisma.usuario.findMany({ orderBy: { createdAt: "desc" } });
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    const data = { ...dto };
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }
    return this.prisma.usuario.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }

  async verifyPassword(email: string, senha: string): Promise<boolean> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.senha) return false;
    return bcrypt.compare(senha, usuario.senha);
  }

  async findAdmin(): Promise<{ id: number; nome: string; email: string } | null> {
    const admin = await this.prisma.usuario.findFirst({ where: { isAdmin: true } });
    if (!admin) return null;
    return { id: admin.id, nome: admin.nome, email: admin.email };
  }
}
