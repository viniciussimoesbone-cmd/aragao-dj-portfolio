# DJ Aragão — site institucional + NIVORA (núcleo de gestão)

Este projeto tem duas partes no mesmo app Next.js:

1. **Site institucional do DJ Aragão** (`src/app/page.tsx`) — página pública com Hero, Sobre,
   Experiência, Agenda, Galeria, Vídeos, Social e um formulário de contato que abre o WhatsApp
   com os dados preenchidos. Todo o conteúdo textual e os caminhos de imagem/vídeo ficam
   centralizados em `src/lib/site/content.ts`.
2. **NIVORA** — núcleo de gestão de negócio (clientes, catálogo, orçamentos, contratos,
   financeiro e execução de projetos), exposto hoje só como API HTTP (sem telas). Pensado para,
   futuramente, ser a base de um painel interno de administração dos contratos/eventos do
   próprio Aragão (e, depois, de outros artistas).

Deploy: https://aragao-dj-portfolio.vercel.app (Vercel, branch `main`, Postgres no Supabase)

## NIVORA — Fase 0 (núcleo)

Esta fase cobre apenas o modelo de dados e as regras de negócio centrais (sem interface):

- **Clientes** — cadastro básico
- **Catálogo** de produtos/serviços (preço-base editável, modelo de cobrança)
- **Orçamentos** com itens e cálculo de valor final
- **Contratos** gerados automaticamente a partir de orçamento aprovado
- **Financeiro do contrato** — status, multa (10%), juros (0,33%/dia), suspensão após 10 dias de atraso, e regra de cancelamento com aviso de 15 dias
- **Projetos** — liberação de execução após confirmação de pagamento

Todas as regras de multa/juros/suspensão/cancelamento vivem em **um único módulo central**:
`src/lib/financeiro.ts` — nenhuma outra parte do sistema deve reimplementar essas fórmulas.

O site institucional do DJ Aragão ainda não consome essas APIs — o formulário de contato
(`src/components/site/Booking.tsx`) só monta uma mensagem e abre o WhatsApp. A integração entre
o formulário público e os orçamentos/contratos do NIVORA é trabalho futuro.

## API (endpoints implementados até agora)

Endpoints HTTP reais (`src/app/api/.../route.ts`) — não Server Actions — pensados para serem
consumidos tanto por um futuro painel interno quanto, futuramente, por sistemas externos
entregues a clientes (ex: checar se o pagamento está em dia para liberar/bloquear acesso).

| Rota | O que faz |
|---|---|
| `GET, POST /api/clientes` | Lista / cria clientes |
| `GET, PATCH, DELETE /api/clientes/:id` | Busca / atualiza / remove um cliente |
| `GET, POST /api/produtos-servicos` | Lista (`?ativo=true\|false` opcional) / cria itens de catálogo |
| `GET, PATCH /api/produtos-servicos/:id` | Busca / atualiza um item de catálogo (remoção é sempre soft delete via `ativo: false`) |
| `GET, POST /api/orcamentos` | Lista (`?clienteId=&status=` opcionais) / cria orçamento com itens (valor total calculado automaticamente) |
| `GET, PATCH /api/orcamentos/:id` | Busca / atualiza orçamento (forma de pagamento, observações, status, ou substitui os itens por inteiro — bloqueado depois de aprovado) |
| `POST /api/orcamentos/:id/aprovar` | Aprova o orçamento e gera o contrato (+ parcela(s) inicial(is) + registro de projeto) |
| `POST /api/parcelas/:id/pagamento` | Confirma pagamento de uma parcela; libera o projeto, reavalia suspensão, gera a próxima mensalidade (ou encerra o contrato, se essa era a última devida) |
| `POST /api/contratos/:id/cancelamento` | Registra pedido de cancelamento e calcula/congela a última parcela devida (regra dos 15 dias) |

A lógica de negócio de cada rota vive em `src/lib/services/` (funções puras, testáveis sem banco);
as rotas em `src/app/api/` são só a camada HTTP fina por cima delas.

Item de orçamento aceita `produtoServicoId`, `precoNegociado` (opcional — default é o `precoBase`
do catálogo), `valorImplantacao` (só para modelo `IMPLANTACAO_MAIS_MENSAL`) e `quantidade`.

## Stack

- Next.js (App Router) + TypeScript — frontend e backend no mesmo projeto
- Tailwind CSS — estilo do site institucional
- PostgreSQL (Supabase) via Prisma (`prisma/schema.prisma`)
- Vitest para testes

## Como rodar

```bash
npm install
cp .env.example .env   # preencher DATABASE_URL/DIRECT_URL do seu projeto Supabase
npm run prisma:migrate # cria as tabelas no banco
npm test                # roda os testes da lógica financeira e dos serviços
npm run dev              # sobe o Next.js em http://localhost:3000
```

## Estrutura

```
prisma/schema.prisma           modelo de dados (clientes, catálogo, orçamentos, contratos, parcelas, projetos)
src/app/page.tsx               página única do site institucional do DJ Aragão
src/app/api/                   endpoints HTTP do NIVORA (clientes, catálogo, orçamentos, aprovação, pagamento, cancelamento)
src/components/site/           componentes visuais do site (Header, Hero, About, Experience, Agenda, Gallery, Videos, Social, Booking, Footer...)
src/lib/site/content.ts        todo o conteúdo textual e os caminhos de imagem/vídeo do site
public/images, public/videos   assets do site (logo, fotos, vídeos)
src/lib/prisma.ts              singleton do PrismaClient (padrão recomendado p/ hot-reload do Next.js)
src/lib/http.ts                helpers das rotas (parse de body JSON, tradução de erro -> resposta HTTP)
src/lib/db.ts                  tipo Db (PrismaClient | client em transação) usado pelos serviços
src/lib/enums.ts               listas fechadas de validação (forma de pagamento, modelo de cobrança, status)
src/lib/financeiro.ts          função central de cálculo financeiro (multa, juros, suspensão, cancelamento)
src/lib/services/              lógica de negócio por trás das rotas de API do NIVORA (testável sem banco)
src/lib/__tests__/             testes das regras de negócio financeiras
src/lib/services/__tests__/    testes dos serviços (CRUD, aprovação, pagamento, cancelamento)
```
