import { About } from "@/components/site/About";
import { Agenda } from "@/components/site/Agenda";
import { Booking } from "@/components/site/Booking";
import { Experience } from "@/components/site/Experience";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Social } from "@/components/site/Social";
import { Videos } from "@/components/site/Videos";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Agenda />
        <Gallery />
        <Videos />
        <Social />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
