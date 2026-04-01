# Plano: API NestJS + Prisma + PostgreSQL

## Visão Geral

Este documento contém um plano completo e um tutorial para configurar uma API com **NestJS**, **Prisma ORM** e **PostgreSQL**.

---

## 1. Pré-requisitos

- **Node.js** >= 18 (ou **Bun** >= 1.0)
- **PostgreSQL** instalado e rodando (local ou via Docker)
- **npm** / **yarn** / **pnpm** / **bun** como gerenciador de pacotes

---

## 2. Instalação

### 2.1. Instalar o NestJS CLI

```bash
npm i -g @nestjs/cli
```

### 2.2. Instalar dependências do Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 2.3. Inicializar o Prisma

```bash
npx prisma init
```

Isso cria:
- `prisma/schema.prisma` — arquivo de modelo do banco
- `.env` — variável `DATABASE_URL`

### 2.4. Configurar o `.env`

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/lauras_atelie?schema=public"
```

### 2.5. Configurar o `schema.prisma`

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Produto {
  id          Int      @id @default(autoincrement())
  nome        String
  descricao   String?
  preco       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2.6. Rodar a migração

```bash
npx prisma migrate dev --name init
```

---

## 3. Integrar Prisma com NestJS

### 3.1. Gerar o Prisma Client

```bash
npx prisma generate
```

### 3.2. Criar o PrismaService

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 3.3. Criar o PrismaModule

```typescript
// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 4. Exemplos de Código — CRUD Completo

### 4.1. Gerar um módulo com CLI

```bash
npx nest generate module produtos
npx nest generate service produtos
npx nest generate controller produtos
```

### 4.2. DTOs

```typescript
// src/produtos/dto/create-produto.dto.ts
export class CreateProdutoDto {
  nome: string;
  descricao?: string;
  preco: number;
}
```

```typescript
// src/produtos/dto/update-produto.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {}
```

> Instalar: `npm install @nestjs/mapped-types`

### 4.3. Service

```typescript
// src/produtos/produtos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto });
  }

  findAll() {
    return this.prisma.produto.findMany();
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });
    if (!produto) throw new NotFoundException(`Produto #${id} não encontrado`);
    return produto;
  }

  async update(id: number, dto: UpdateProdutoDto) {
    await this.findOne(id); // verifica se existe
    return this.prisma.produto.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.produto.delete({ where: { id } });
  }
}
```

### 4.4. Controller

```typescript
// src/produtos/produtos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly service: ProdutosService) {}

  @Post()
  create(@Body() dto: CreateProdutoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
```

### 4.5. Module

```typescript
// src/produtos/produtos.module.ts
import { Module } from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { ProdutosController } from './produtos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProdutosController],
  providers: [ProdutosService],
})
export class ProdutosModule {}
```

---

## 5. App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ProdutosModule } from './produtos/produtos.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ProdutosModule],
})
export class AppModule {}
```

---

## 6. Main (entry point)

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}
bootstrap();
```

> Instalar para validação: `npm install class-validator class-transformer`

---

## 7. Comandos úteis do Prisma

| Comando | Descrição |
|---|---|
| `npx prisma init` | Inicializa o Prisma no projeto |
| `npx prisma generate` | Gera o Prisma Client |
| `npx prisma migrate dev` | Cria e aplica migração (dev) |
| `npx prisma migrate deploy` | Aplica migrações (produção) |
| `npx prisma studio` | Abre UI visual do banco |
| `npx prisma db push` | Sincroniza schema sem migração (prototipagem) |
| `npx prisma db seed` | Roda o seed do banco |

---

## 8. Rodando o projeto

```bash
# Instalar dependências
npm install

# Gerar o client do Prisma
npx prisma generate

# Rodar migrações
npx prisma migrate dev

# Iniciar em modo dev (watch)
npm run start:dev
```

---

## 9. Estrutura de pastas sugerida

```
src/
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── produtos/
│   ├── dto/
│   │   ├── create-produto.dto.ts
│   │   └── update-produto.dto.ts
│   ├── produtos.service.ts
│   ├── produtos.controller.ts
│   └── produtos.module.ts
├── app.module.ts
└── main.ts
prisma/
└── schema.prisma
.env
```

---

## 10. Próximos passos recomendados

1. **Autenticação** — JWT com `@nestjs/jwt` e `@nestjs/passport`
2. **Validação avançada** — Decorators do `class-validator` nos DTOs
3. **Relacionamentos** — Adicionar models com `@relation` no Prisma
4. **Paginação e filtros** — `skip`, `take`, `where` no Prisma
5. **Testes** — `@nestjs/testing` com mocks do Prisma
6. **Docker** — Containerizar a API e o PostgreSQL com `docker-compose`
7. **Swagger** — `@nestjs/swagger` para documentação automática da API
