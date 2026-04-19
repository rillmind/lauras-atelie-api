# Laura's Ateliê API — CLAUDE.md

## Visão Geral do Projeto

API REST em NestJS para gerenciar catálogo de peças de crochê e clientes do Laura's Ateliê.

### Stack
- **Framework**: NestJS 11
- **Runtime**: Bun
- **ORM**: Prisma 7
- **Banco**: PostgreSQL (Neon - serverless)
- **Storage**: Supabase Storage (bucket público)
- **Linguagem**: TypeScript
- **Validação**: class-validator + class-transformer
- **Hash**: bcryptjs

### Estrutura de Arquivos
```
src/
  main.ts                   # Bootstrap (CORS habilitado, ValidationPipe, porta 3001)
  app.module.ts             # Módulo raiz (PrismaModule, ProdutosModule, UsuariosModule, UploadModule, MulterModule)
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
  upload/
    upload.controller.ts    # POST /upload (Supabase Storage)
    upload.module.ts
  lib/
    supabase.ts             # Cliente Supabase configurado
  generated/prisma/         # Prisma Client gerado (não commitar)
prisma/
  schema.prisma             # Schema do banco
  migrations/               # Migrações
```

## Comandos Essenciais

```bash
# Instalar dependências
bun install

# Gerar Prisma Client
bun run prisma:generate

# Rodar migrações (aplica no Neon)
bun run prisma:migrate

# Abrir Prisma Studio
bun run prisma:studio

# Iniciar dev server (watch)
bun run start:dev

# Build
bun run build

# Rodar seed (cria admin + produtos exemplo)
bun run seed
```

## Endpoints da API

### Produtos (`/produtos`)
- `POST /` — Criar produto (aceita `imagemUrl`)
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

### Upload (`/upload`)
- `POST /` — Upload de imagem (multipart/form-data, campo `file`)
  - Upload para Supabase Storage (bucket `product-icons`)
  - Retorna URL pública da imagem
  - Limite: 5MB por arquivo

## Schema do Banco

### Produto
- `id`: Int (auto)
- `nome`: String
- `descricao`: String?
- `preco`: Float
- `categoria`: String (default: "pronta")
- `imagemUrl`: String? (URL da imagem no Supabase)
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
```env
DATABASE_URL=postgresql://... (Neon connection string com sslmode=require)
PORT=3001
SUPABASE_URL=https://vnydfmnxmtsmyaiewspb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Deploy (Render)
- API rodando em: `https://lauras-atelie-api.onrender.com`
- Variáveis de ambiente configuradas no Render Dashboard
- Banco de dados: Neon (PostgreSQL serverless)
- Storage: Supabase (bucket público `product-icons`)

## Convenções

### DTOs
- Usar `class-validator` decorators para validação
- `whitelist: true` + `transform: true` no ValidationPipe global

### Prisma
- Client gerado em `src/generated/prisma/` (não commitar)
- Usa `@prisma/adapter-pg` para conexão direta com PostgreSQL
- `moduleFormat: "cjs"` no generator
- Conexão SSL obrigatória (Neon)

### CORS
- Habilitado para todas as origens (`origin: true`)
- Métodos: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true

### Upload de Imagens
- Bucket Supabase é **público**
- URL gerada é direta (não assinada)
- Formato: `https://<supabase-url>/storage/v1/object/public/product-icons/<filename>`
- Transformação de imagem: redimensionamento via query params do Supabase

## Regras de Negócio
- Produtos podem ser "pronta" (pronta entrega) ou "encomenda"
- Usuários podem ser admin (`isAdmin: true`)
- Senha é opcional no schema (pode ser null)
- Verificação de senha retorna boolean, não token JWT
- Imagens são opcionais nos produtos

## Seed
- Cria admin: `admin@laurasatelie.com` / senha: `41422006`
- Cria 2 produtos de exemplo (com `imagemUrl: null`)

## Fluxo de Trabalho Típico

1. Gerar client: `bun run prisma:generate`
2. Rodar migrações: `bun run prisma:migrate`
3. Rodar seed (opcional): `bun run seed`
4. Iniciar servidor: `bun run start:dev`
5. Testar: `curl https://lauras-atelie-api.onrender.com/produtos`

## Deploy

### API (Render)
```bash
# Commit e push triggeram deploy automático
git add .
git commit -m "feat: descrição"
git push
```

### Variáveis no Render Dashboard
- `DATABASE_URL`: Neon connection string
- `SUPABASE_URL`: URL do Supabase
- `SUPABASE_ANON_KEY`: Chave anon do Supabase
- `PORT`: 3001
