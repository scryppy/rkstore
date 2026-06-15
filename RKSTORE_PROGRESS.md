# RKStore — E-Commerce de Roupas

## 📊 Status Atual

**Data:** Junho 2026  
**Stack:** Next.js 15 + Supabase + Vercel  
**Fase:** 2/5 (Infraestrutura completa, iniciando desenvolvimento)

---

## ✅ Concluído

### Infraestrutura
- [x] Repositório GitHub criado (`scryppy/rkstore`)
- [x] Projeto Supabase criado (região: São Paulo)
- [x] Schema SQL completo rodado sem erros
- [x] Bucket Supabase `product-images` criado (público)
- [x] Usuário admin criado + role JWT definida
- [x] Projeto Next.js scaffoldado
- [x] Vercel conectado com deploy automático (main branch)
- [x] Variáveis de ambiente configuradas

### Código Base
- [x] `src/lib/types.ts` — tipos TypeScript completos
- [x] `src/lib/supabase/client.ts` — client browser
- [x] `src/lib/supabase/server.ts` — client server-side
- [x] `src/middleware.ts` — proteção rotas /admin
- [x] `src/store/cart.ts` — Zustand cart store (persistido)
- [x] Dependências instaladas (supabase-js, ssr, lucide, hookform, zod, zustand)

### Configuração
- [x] `.env.local` criado e no `.gitignore`
- [x] NextAuth secret gerado
- [x] RLS (Row Level Security) configurado no Supabase

---

## 🚀 Próximas Fases

### Fase 3: Painel Admin (Login + Produtos)
```
1. Tela de login (/admin/login)
   - Form com email/senha
   - Supabase Auth (signInWithPassword)
   - Redirecionamento pós-login para /admin/dashboard

2. Dashboard (/admin)
   - Lista de produtos (tabela ou cards)
   - Botões: Novo, Editar, Deletar
   - Status: ativo/inativo

3. Cadastro de Produtos (/admin/produtos/novo)
   - Form: nome, descrição, preço, categoria
   - Upload de fotos (drag-drop)
   - Adicionar variações (tamanho + cor + estoque)
   - Salvar → insere em `products`, `product_variants`, `product_images`

4. Edição de Produtos (/admin/produtos/[id])
   - Pré-populate form
   - Deletar/reordenar fotos
   - Adicionar/remover variações
```

### Fase 4: Loja Pública (Catálogo)
```
1. Home/Catálogo (/)
   - Grid de produtos com filtro por categoria
   - Card mostra: foto cover, nome, preço
   - Click → /produto/[id]

2. Página do Produto (/produto/[id])
   - Galeria de fotos
   - Descrição completa
   - Seletor: tamanho, cor, quantidade
   - Botão "Adicionar ao carrinho"
   - Aviso de estoque baixo

3. Carrinho (/carrinho)
   - Lista de itens
   - Remover item
   - Atualizar quantidade
   - Total + frete (estimado)
   - Botão "Ir para checkout"
```

### Fase 5: Checkout + Pagamento
```
1. Checkout (/checkout)
   - Formulário: dados cliente, endereço
   - Seletor: método pagamento
   - Integração Mercado Pago (PIX/cartão/boleto)
   
2. Confirmação pós-pagamento
   - Email para cliente
   - Email para admin com detalhes
```

---

## 📂 Estrutura de Pastas (Esperada)

```
src/
├── app/
│   ├── (store)/
│   │   ├── page.tsx           # Home catálogo
│   │   ├── produto/[id]/page.tsx
│   │   ├── carrinho/page.tsx
│   │   └── checkout/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── layout.tsx         # layout protegido
│   │   ├── dashboard/page.tsx
│   │   ├── produtos/
│   │   │   ├── page.tsx       # lista
│   │   │   ├── novo/page.tsx  # criar
│   │   │   └── [id]/page.tsx  # editar
│   │   └── pedidos/page.tsx
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── types.ts
│   └── utils.ts               # helpers
├── components/
│   ├── store/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── CartSummary.tsx
│   └── admin/
│       ├── AdminNav.tsx
│       ├── ProductForm.tsx
│       └── OrderTable.tsx
├── store/
│   └── cart.ts
└── middleware.ts
```

---

## 🔑 Credenciais Importantes

**Supabase**
- Project URL: armazenado em `.env.local`
- Anon key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role: `SUPABASE_SERVICE_ROLE_KEY`

**Vercel**
- Production branch: `main`
- Preview branches: qualquer branch fora de main
- Deploy automático: ativado

**GitHub**
- Repo: `github.com/scryppy/rkstore`
- Branch produção: `main`
- Branch dev: `whxami` (opcional)

---

## 📝 Git Workflow

```bash
# Desenvolvimento local
git checkout -b feature/sua-feature
# ... edita arquivos ...
git add .
git commit -m "feat: descrição"
git push origin feature/sua-feature

# Para produção (após revisar)
git checkout main
git pull origin main
git merge feature/sua-feature
git push origin main
# ↑ Vercel detecta e faz deploy automático
```

---

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
npm install

# Dev local
npm run dev  # acessa localhost:3000

# Build produção
npm run build
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## ⚠️ Notas Importantes

1. **RLS está ativado** — rotas públicas acessam dados com RLS `is_active = true`
2. **Middleware protege /admin** — redireciona para login se não autenticado
3. **Cart é persistido no localStorage** — survives page refresh
4. **Imagens vão pro Supabase Storage** — use path `products/{product_id}/{filename}`
5. **Admin role é via JWT claim** — definido no banco via `raw_app_meta_data`

---

## 📞 Próxima Sessão

Quando retomar:
- Comece pela **Fase 3: Painel Admin**
- Prioridade: Tela de login + dashboard + form de produto
- Depois vem a loja pública (catálogo é mais simples)

---

**Atualizado:** Junho 2026