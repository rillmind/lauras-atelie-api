# Laura's Ateliê API — CLAUDE.md

## Visão Geral do Projeto

API REST em NestJS para gerenciar catálogo de peças de crochê e clientes do Laura's Ateliê.

### Stack
- **Framework**: NestJS 11
- **Runtime**: Bun
- **ORM**: Prisma 7
- **Banco**: PostgreSQL 17 (via Docker)
- **Linguagem**: TypeScript
- **Validação**: class-validator + class-transformer
- **Hash**: bcryptjs

### Estrutura de Arquivos
```
src/
  main.ts                   # Bootstrap (CORS, ValidationPipe, porta 3001)
  app.module.ts             # Módulo raiz
  prisma/
    prisma.module.ts        # Módulo Prisma
    prisma.service.ts       # Service com PrismaClient + adapter-pg
  produtos/
    produtos.controller.ts  # CRUD /produtos
    produtos.service.ts     # Lógica de produtos
    produtos.module.ts
    dto/
      create-produto.dto.ts
      update-produto.dto.ts
  usuarios/
    usuarios.controller.ts  # CRUD /usuarios + /verify-password + /admin
    usuarios.service.ts     # Lógica de usuários + bcrypt
    usuarios.module.ts
    dto/
      create-usuario.dto.ts
      update-usuario.dto.ts
  generated/prisma/         # Prisma Client gerado (não commitar)
prisma/
  schema.prisma             # Schema do banco
  migrations/               # Migrações
docker-compose.yaml         # PostgreSQL container
```

## Comandos Essenciais

```bash
# Instalar dependências
bun install

# Subir banco
bun run docker:up

# Gerar Prisma Client
bun run prisma:generate

# Rodar migrações
bun run prisma:migrate

# Abrir Prisma Studio
bun run prisma:studio

# Iniciar dev server (watch)
bun run start:dev

# Build
bun run build

# Derrubar banco
bun run docker:down
```

## Endpoints da API

### Produtos (`/produtos`)
- `POST /` — Criar produto
- `GET /` — Listar todos
- `GET /:id` — Buscar por ID
- `PUT /:id` — Atualizar
- `DELETE /:id` — Deletar

### Usuários (`/usuarios`)
- `POST /` — Criar usuário (senha é hasheada automaticamente)
- `GET /` — Listar todos (ordenado por createdAt desc)
- `GET /:id` — Buscar por ID
- `PUT /:id` — Atualizar (senha é hasheada se fornecida)
- `DELETE /:id` — Deletar
- `POST /verify-password` — Verificar senha (body: `{ email, senha }`)
- `GET /admin` — Buscar usuário admin

## Schema do Banco

### Produto
- `id`: Int (auto)
- `nome`: String
- `descricao`: String?
- `preco`: Float
- `categoria`: String (default: "pronta")
- `imagem`: String?
- `materiais`: String[]
- `dimensoes`: String?
- `createdAt`, `updatedAt`: DateTime

### Usuario
- `id`: Int (auto)
- `nome`: String
- `email`: String (unique)
- `telefone`: String
- `senha`: String? (hash bcrypt)
- `isAdmin`: Boolean (default: false)
- `createdAt`, `updatedAt`: DateTime

## Configuração

### Variáveis de Ambiente (`.env`)
- `DATABASE_URL` — URL do PostgreSQL (ex: `postgresql://postgres:postgres@localhost:5432/lauras_atelie`)
- `PORT` — Porta do servidor (default: 3001)

### Docker
- Container: `lauras-atelie-db`
- Porta: `5432:5432`
- User: `postgres` / Password: `postgres`
- Database: `lauras_atelie`

## Convenções

### DTOs
- Usar `class-validator` decorators para validação
- `whitelist: true` + `transform: true` no ValidationPipe global

### Prisma
- Client gerado em `src/generated/prisma/` (não commitar)
- Usa `@prisma/adapter-pg` para conexão direta com PostgreSQL
- `moduleFormat: "cjs"` no generator

### Erros
- `NotFoundException` quando produto não existe
- Senhas sempre hasheadas com bcrypt (salt 10)

## Regras de Negócio
- Produtos podem ser "pronta" (pronta entrega) ou sob encomenda (campo `categoria`)
- Usuários podem ser admin (`isAdmin: true`)
- Senha é opcional no schema (pode ser null)
- Verificação de senha retorna boolean, não token JWT

## Fluxo de Trabalho Típico

1. Subir banco: `bun run docker:up`
2. Gerar client: `bun run prisma:generate`
3. Rodar migrações: `bun run prisma:migrate`
4. Iniciar servidor: `bun run start:dev`
5. Testar: `curl http://localhost:3001/produtos`
