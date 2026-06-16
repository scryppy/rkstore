# RKStore — Checkpoint do Projeto

> Última atualização: 2026-06-15. Loja MVP no ar e funcionando em produção.

## Visão geral
Loja e-commerce de roupas (do cunhado do André). Vitrine pública + carrinho + checkout que grava pedido no Supabase.

- **Repo:** github.com/scryppy/rkstore
- **Produção (Vercel):** https://rkstore-two.vercel.app  (deploy automático da branch `main`)
- **Stack:** Next.js 16.2.9 (App Router + Turbopack) · React 19.2.4 · Tailwind v4 · TypeScript · Supabase JS

## Status atual — FUNCIONANDO
- [x] Loja MVP construída e portada pro stack do repo
- [x] Build passando na Vercel
- [x] Deploy de produção no ar (após corrigir env vars)
- [x] Supabase com schema + RLS do próprio usuário (intacto)
- [ ] Catálogo VAZIO — sem produtos cadastrados ainda (vitrine mostra "nenhum produto")
- [x] Painel admin /admin (login, produtos+variantes+fotos, categorias, pedidos) — FEITO (build OK)

## Supabase
- **Projeto:** RK-Store · ref `bdldlnmuqhwbkqlwsnyi` · região us-east-1
- **URL:** https://bdldlnmuqhwbkqlwsnyi.supabase.co
- **Tabelas:** categories, products, product_variants (size/color/stock/sku), product_images, customers, customer_addresses, orders (enum order_status: pending/paid/processing/shipped/delivered/cancelled), order_items, carts, cart_items
- **RLS (do usuário, NÃO mexer sem necessidade):** `*_leitura_publica` (catálogo público p/ anon), `*_admin`, `carrinho_sessao`, `pedidos_admin`
- **Bucket:** product-images (público) para fotos de produto
- O catálogo de leitura usa a chave anon (publishable). Escrita de pedido usa service-role no servidor.

## Variáveis de ambiente (Vercel: Settings > Environment Variables, escopo Production)
NEXT_PUBLIC vars são "congeladas" no build — ao alterar, precisa REDEPLOY com rebuild.

    NEXT_PUBLIC_SUPABASE_URL=https://bdldlnmuqhwbkqlwsnyi.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9Q7WSSAzTGKUw13l3FZnNA_nFPHqg3j
    SUPABASE_SERVICE_ROLE_KEY=<secret: Supabase > Settings > API > service_role>

(No local, mesmos valores em `.env.local` — já existe e está no .gitignore.)

## Estrutura do código
    app/
      page.tsx              vitrine (revalidate=0, dinâmica)
      categoria/[slug]/     produtos por categoria (params async)
      produto/[id]/         detalhe + seleção de variante/estoque (params async)
      carrinho/             carrinho (client)
      checkout/             form -> server action createOrder
      pedido/[id]/          confirmação (lê pedido via service-role)
      not-found.tsx
      layout.tsx            CartProvider + Navbar + footer (mantém fontes Geist)
      globals.css           Tailwind v4 (@theme: --color-brand-accent #c8a24a)
    components/
      CartProvider.tsx      carrinho via Context + localStorage (chave "rk-cart")
      Navbar.tsx  ProductCard.tsx  AddToCart.tsx
    lib/
      supabase.ts           getSupabase() anon, lazy (só valida env em runtime)
      supabaseAdmin.ts      getSupabaseAdmin() service-role, server-only
      queries.ts            getCategories/getProducts/getProductById
      actions.ts            "use server" createOrder() -> grava cliente/endereço/pedido/itens
      types.ts  format.ts   (formatBRL, coverImage)

## Decisões importantes
- **Checkout via service-role** (server-only) em vez de abrir RLS — mantém pedidos privados. Por isso a SUPABASE_SERVICE_ROLE_KEY é obrigatória.
- **Carrinho client-side** (localStorage), não usa as tabelas carts/cart_items do banco.
- Mantido o stack moderno do repo (Next 16/Tailwind 4) em vez de rebaixar.

## Painel admin (/admin) — NOVO
- **Auth:** gate por senha única (sem Supabase Auth, sem novas deps). Cookie httpOnly assinado por HMAC.
  - middleware.ts protege /admin/* (exceto /admin/login).
  - lib/adminAuth.ts (token HMAC), lib/adminActions.ts (login/logout + CRUD), lib/adminQueries.ts (leitura service-role).
- **Env novas (Vercel + .env.local):** `ADMIN_PASSWORD` (senha do cunhado) e `ADMIN_SECRET` (assina cookie; manter igual nos dois ambientes).
- **Funções:** dashboard com contadores; produtos (criar/editar/excluir + variantes com estoque inline + upload de fotos pro bucket product-images com capa); categorias (criar/excluir); pedidos (listar + detalhe + mudar status).
- Todas as escritas via service-role (server actions), igual ao checkout.

## Próximos passos sugeridos
1. **Cadastrar produtos** (catálogo está vazio). Opções: criar painel admin (próxima fase), inserir via SQL/Supabase Studio, ou pedir reseed de exemplos pro Claude.
2. **Painel admin** (/admin): login Supabase Auth, CRUD de produtos, upload de fotos pro bucket product-images, gestão de pedidos. (Estava no plano original em RKSTORE_PROGRESS.md.)
3. **Imagens**: configurar upload real; remotePatterns já liberou supabase storage + picsum em next.config.ts.
4. ~~Pagamento real~~ FEITO: Mercado Pago Checkout Pro (redirect) + webhook. Ver seção abaixo.
5. **Frete** (hoje "a calcular").

## Pagamento — Mercado Pago (Checkout Pro) — NOVO
- **Fluxo:** checkout cria pedido (status pending) + preferência MP (REST, sem SDK) e redireciona o cliente pro `init_point`. Cliente paga no ambiente do MP e volta pra /pedido/[id].
- **Confirmação:** webhook `app/api/webhooks/mercadopago` (POST/GET) re-consulta o pagamento na API do MP (não confia no corpo), mapeia status e atualiza o pedido (approved->paid, rejected/cancelled->cancelled, pending->pending). Guarda payment_id.
- **Arquivos:** lib/mercadopago.ts (createPreference/getPayment/mapPaymentStatus), lib/actions.ts (createOrderAndCheckout + insertOrder helper; createOrder mantido), app/checkout (redireciona), app/pedido/[id] (status real), app/api/webhooks/mercadopago.
- **Env novas (Vercel + .env.local):** `MP_ACCESS_TOKEN` (access token MP; produção pra cobrar de verdade, teste pra simular) e `NEXT_PUBLIC_SITE_URL` (usada em back_urls/notification_url; sem barra no fim).
- **Webhook só dispara em produção** (precisa URL pública https). Local não confirma automático.
- back_urls success/pending/failure -> /pedido/[id]; auto_return=approved.

## Melhorias (admin + estoque + pedidos) — NOVO
- **Baixa de estoque na venda:** migration add_stock_control_and_tracking (colunas orders.stock_applied bool, orders.tracking_code text; função apply_order_stock(p_order) idempotente). Webhook chama rpc apply_order_stock quando paga. insertOrder valida estoque antes de criar pedido/preferência (não vende mais do que tem).
- **Admin mais ágil:** ImageManager faz upload de várias fotos de uma vez + reordenar (← →) + definir capa; VariantManager adiciona em lote (cor + tamanhos separados por vírgula + estoque). Actions novas: reorderImage, addVariantsBatch.
- **Gestão de pedidos:** lista com filtro por status (chips) + busca por nome/e-mail; detalhe com campo de código de rastreio (action updateOrderTracking, opção marcar como Enviado) e botão "Avisar cliente no WhatsApp" (link wa.me pronto, sem API).

## Pitfalls conhecidos (IMPORTANTE pra próximo chat)
- **Mount OneDrive corrompe arquivos** ao escrever via ferramentas Write/Edit: injeta byte nulo (\0) OU trunca o arquivo no meio. Isso quebra o build Turbopack ("Unexpected character '\0'" / "Unterminated string constant"). SEMPRE escrever via bash heredoc e verificar com: `tr -cd '\000' < f | wc -c` (deve ser 0) e conferir `tail` do arquivo. NÃO confiar em `grep -P '\x00'` (falso negativo).
- `npm install` trava no mount OneDrive (rename ENOTEMPTY) — instalar/buildar fora do mount se precisar testar local.
- Next 16: `params` é Promise, precisa `await params`.
- Evitar `export const dynamic = "force-dynamic"` em rota (bug SWC visto) — usar `export const revalidate = 0`.
- Branch local de trabalho: `whxami`. Produção: `main`. Deploy: `git push origin whxami:main`.
