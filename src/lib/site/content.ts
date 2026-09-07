export const artist = {
  stageName: "ARAGÃO",
  fullName: "João Aragão",
  role: "DJ & Producer",
  instagramHandle: "@aragaodj",
  instagramUrl: "https://www.instagram.com/aragaodj",
  whatsappNumber: "(47) 98448-5341",
  whatsappLink: "https://wa.me/5547984485341",
  whatsappDefaultMessage:
    "Olá, Aragão! Vim pelo site e gostaria de solicitar informações sobre uma contratação.",
  logo: { src: "/images/logo.png", alt: "Logo DJ Aragão" },
};

export const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#sobre" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Agenda", href: "#agenda" },
  { label: "Mídia", href: "#midia" },
  { label: "Contato", href: "#contato" },
];

export const hero = {
  eyebrow: "DJ & PRODUCER",
  title: "ARAGÃO",
  subtitle:
    "Experiência, energia e música para transformar cada evento em uma experiência inesquecível.",
  primaryCta: { label: "Contratar agora", href: "#contato" },
  secondaryCta: { label: "Ver experiências", href: "#experiencia" },
  image: "/images/hero.jpg",
};

export const about = {
  eyebrow: "SOBRE O ARTISTA",
  title: "MAIS QUE UM DJ. UMA EXPERIÊNCIA.",
  paragraph:
    "João Aragão, conhecido artisticamente como Aragão, atua como DJ e produtor musical, levando personalidade, presença de palco e experiência musical para diferentes tipos de eventos.",
  bioPlaceholder:
    "Biografia oficial completa em breve — espaço reservado para a trajetória, formação e marcos da carreira do artista.",
  stats: [
    { value: "+XX", label: "Eventos" },
    { value: "+XX", label: "Cidades" },
    { value: "+XX", label: "Experiências" },
  ],
  image: "/images/about.jpg",
};

export type ExperienceCategory =
  | "Eventos"
  | "Festas"
  | "Clubs"
  | "Festivais"
  | "Shows"
  | "Produções"
  | "Eventos corporativos";

export const experienceItems: {
  category: ExperienceCategory;
  description: string;
  featured?: boolean;
  image?: string;
}[] = [
  {
    category: "Eventos",
    description: "Aniversários, formaturas e celebrações com trilha sonora sob medida.",
    featured: true,
  },
  {
    category: "Festas",
    description: "Sets de alta energia para pistas cheias do início ao fim da noite.",
  },
  {
    category: "Clubs",
    description: "Residências e apresentações em casas noturnas e clubs selecionados.",
  },
  {
    category: "Festivais",
    description: "Performances em grandes palcos, para públicos de todos os tamanhos.",
    featured: true,
  },
  {
    category: "Shows",
    description: "Apresentações autorais com identidade sonora própria do Aragão.",
    image: "/images/experience-shows.jpg",
  },
  {
    category: "Produções",
    description: "Produção musical, remixes e sets exclusivos por trás das faixas.",
  },
  {
    category: "Eventos corporativos",
    description: "Ativações de marca e eventos empresariais com curadoria musical premium.",
  },
];

export type AgendaEvent = {
  day: string;
  month: string;
  name: string;
  venue: string;
  city: string;
  time: string;
  href?: string;
};

// Nenhuma data oficial cadastrada ainda — mantenha este array vazio até que
// o artista confirme eventos reais. A seção exibe automaticamente a mensagem
// "Novas datas em breve." enquanto ele estiver vazio.
export const agendaEvents: AgendaEvent[] = [];

export type GalleryCategory = "Shows" | "Eventos" | "Bastidores" | "Público" | "Produções";

export const galleryItems: { category: GalleryCategory; image?: string; span?: "tall" | "wide" }[] = [
  { category: "Shows", span: "tall", image: "/images/gallery-2.jpg" },
  { category: "Eventos" },
  { category: "Bastidores" },
  { category: "Público", span: "wide", image: "/images/gallery-1.jpg" },
  { category: "Produções" },
  { category: "Shows" },
  { category: "Eventos", span: "tall" },
  { category: "Bastidores", span: "wide" },
  { category: "Público" },
  { category: "Produções" },
];

export type VideoPlatform = "YouTube" | "Instagram" | "Hospedado";

export const videoItems: {
  title: string;
  platform: VideoPlatform;
  url?: string;
}[] = [
  { title: "Aftermovie — em breve", platform: "YouTube" },
  { title: "Bastidores no set", platform: "Hospedado", url: "/videos/bastidores-1.mp4" },
  { title: "Clipe de show", platform: "Hospedado", url: "/videos/clipe-set.mp4" },
];

export const socials = [
  {
    label: "Instagram",
    handle: artist.instagramHandle,
    href: artist.instagramUrl,
    active: true,
  },
  { label: "TikTok", handle: "em breve", active: false },
  { label: "YouTube", handle: "em breve", active: false },
  { label: "Spotify", handle: "em breve", active: false },
];

export const eventTypes = [
  "Festa particular",
  "Casamento",
  "Formatura",
  "Evento corporativo",
  "Club / Casa noturna",
  "Festival",
  "Outro",
];
