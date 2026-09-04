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

## Stack

- Node.js + TypeScript
- PostgreSQL (Supabase) via Prisma (`prisma/schema.prisma`)
- Vitest para testes

## Como rodar

```bash
npm install
cp .env.example .env   # preencher DATABASE_URL do seu projeto Supabase
npm run prisma:migrate # cria as tabelas no banco
npm test                # roda os testes da lógica financeira
```

## Estrutura

```
prisma/schema.prisma        modelo de dados (clientes, catálogo, orçamentos, contratos, parcelas, projetos)
src/lib/financeiro.ts       função central de cálculo financeiro (multa, juros, suspensão, cancelamento)
src/lib/__tests__/          testes das regras de negócio
```

A interface (API/telas) ainda não foi construída — é a próxima etapa, sobre esta base.
