# NIVORA

Sistema de gestão de negócio — clientes, catálogo, orçamentos, contratos, financeiro e execução de projetos.

## Fase 0 — Núcleo

Esta fase cobre apenas o modelo de dados e as regras de negócio centrais (sem interface):

- **Clientes** — cadastro básico
- **Catálogo** de produtos/serviços (preço-base editável, modelo de cobrança)
- **Orçamentos** com itens e cálculo de valor final
- **Contratos** gerados automaticamente a partir de orçamento aprovado
- **Financeiro do contrato** — status, multa (10%), juros (0,33%/dia), suspensão após 10 dias de atraso, e regra de cancelamento com aviso de 15 dias
- **Projetos** — liberação de execução após confirmação de pagamento

Todas as regras de multa/juros/suspensão/cancelamento vivem em **um único módulo central**:
`src/lib/financeiro.ts` — nenhuma outra parte do sistema deve reimplementar essas fórmulas.

## API (endpoints implementados até agora)

Endpoints HTTP reais (`src/app/api/.../route.ts`) — não Server Actions — pensados para serem
consumidos tanto pelas telas do NIVORA quanto, futuramente, por sistemas externos entregues a
clientes (ex: checar se o pagamento está em dia para liberar/bloquear acesso).

| Rota | O que faz |
|---|---|
| `POST /api/orcamentos/:id/aprovar` | Aprova o orçamento e gera o contrato (+ parcela(s) inicial(is) + registro de projeto) |
| `POST /api/parcelas/:id/pagamento` | Confirma pagamento de uma parcela; libera o projeto, reavalia suspensão, gera a próxima mensalidade (ou encerra o contrato, se essa era a última devida) |
| `POST /api/contratos/:id/cancelamento` | Registra pedido de cancelamento e calcula/congela a última parcela devida (regra dos 15 dias) |

A lógica de negócio de cada rota vive em `src/lib/services/` (funções puras, testáveis sem banco);
as rotas em `src/app/api/` são só a camada HTTP fina por cima delas.

Ainda não há CRUD de clientes/catálogo/orçamentos — só os 3 fluxos acima.

## Stack

- Next.js (App Router) + TypeScript — frontend e backend no mesmo projeto
- PostgreSQL (Supabase) via Prisma (`prisma/schema.prisma`)
- Vitest para testes

## Como rodar

```bash
npm install
cp .env.example .env   # preencher DATABASE_URL do seu projeto Supabase
npm run prisma:migrate # cria as tabelas no banco
npm test                # roda os testes da lógica financeira
npm run dev              # sobe o Next.js em http://localhost:3000
```

## Estrutura

```
prisma/schema.prisma         modelo de dados (clientes, catálogo, orçamentos, contratos, parcelas, projetos)
src/app/                     App Router do Next.js (páginas e rotas de API)
src/app/api/                 endpoints HTTP (aprovar orçamento, confirmar pagamento, cancelamento)
src/lib/prisma.ts            singleton do PrismaClient (padrão recomendado p/ hot-reload do Next.js)
src/lib/financeiro.ts        função central de cálculo financeiro (multa, juros, suspensão, cancelamento)
src/lib/services/            lógica de negócio por trás das rotas de API (testável sem banco)
src/lib/__tests__/           testes das regras de negócio financeiras
src/lib/services/__tests__/  testes dos serviços (aprovação, pagamento, cancelamento)
```

A página inicial em `src/app/page.tsx` é apenas um placeholder confirmando que o projeto roda —
as telas reais da Fase 0 (clientes, orçamentos, contratos etc.) ainda não foram construídas.
