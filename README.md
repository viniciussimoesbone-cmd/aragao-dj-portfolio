# DJ Aragão — site institucional

Site institucional público do DJ Aragão: Hero, Sobre, Experiência, Agenda, Galeria, Vídeos,
Social e um formulário de contato que abre o WhatsApp com os dados preenchidos. Todo o
conteúdo textual e os caminhos de imagem/vídeo ficam centralizados em
`src/lib/site/content.ts`.

Deploy: https://aragao-dj-portfolio.vercel.app (Vercel, branch `main`)

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS

## Como rodar

```bash
npm install
npm run dev   # sobe o Next.js em http://localhost:3000
```

## Estrutura

```
src/app/layout.tsx           layout raiz (fontes, metadata)
src/app/page.tsx              página única do site
src/components/site/          componentes visuais (Header, Hero, About, Experience, Agenda, Gallery, Videos, Social, Booking, Footer...)
src/lib/site/content.ts       todo o conteúdo textual do site
src/lib/site/whatsapp.ts      helper para montar o link de WhatsApp
src/lib/cn.ts                 helper de composição de classes Tailwind
public/images, public/videos  assets do site (logo, fotos, vídeos)
```
