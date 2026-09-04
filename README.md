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
src/app/api/                 endpoints HTTP (clientes, catálogo, orçamentos, aprovação, pagamento, cancelamento)
src/lib/prisma.ts            singleton do PrismaClient (padrão recomendado p/ hot-reload do Next.js)
src/lib/http.ts              helpers das rotas (parse de body JSON, tradução de erro -> resposta HTTP)
src/lib/db.ts                tipo Db (PrismaClient | client em transação) usado pelos serviços
src/lib/enums.ts             listas fechadas de validação (forma de pagamento, modelo de cobrança, status)
src/lib/financeiro.ts        função central de cálculo financeiro (multa, juros, suspensão, cancelamento)
src/lib/services/            lógica de negócio por trás das rotas de API (testável sem banco)
src/lib/__tests__/           testes das regras de negócio financeiras
src/lib/services/__tests__/  testes dos serviços (CRUD, aprovação, pagamento, cancelamento)
```

A página inicial em `src/app/page.tsx` é apenas um placeholder confirmando que o projeto roda —
as telas reais da Fase 0 (clientes, orçamentos, contratos etc.) ainda não foram construídas.
