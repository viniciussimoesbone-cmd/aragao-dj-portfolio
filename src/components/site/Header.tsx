"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { artist, navLinks } from "@/lib/site/content";
import { cn } from "@/lib/cn";
import { IconClose, IconMenu } from "./Icons";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/10 bg-ink-950/80 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link
          href="#inicio"
          className="font-display bg-[linear-gradient(120deg,#f3d98a_0%,#c9a24b_55%,#8a6a2a_100%)] bg-clip-text text-2xl tracking-wide text-transparent"
        >
          ARAGÃO
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-widest text-ink-200 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="#contato" className="btn-primary">
            Contrate o Aragão
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
        >
          {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-20 z-40 flex flex-col bg-ink-950/98 backdrop-blur-lg transition-all duration-300 lg:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <nav className="container-page flex flex-1 flex-col items-start justify-center gap-6">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${i * 40}ms` : "0ms" }}
              className={cn(
                "heading-display text-4xl text-white transition-all duration-300",
                menuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="container-page safe-b flex flex-col gap-4 pb-10">
          <Link
            href="#contato"
            onClick={() => setMenuOpen(false)}
            className="btn-primary w-full"
          >
            Contrate o Aragão
          </Link>
          <p className="text-center text-xs uppercase tracking-widest text-ink-400">
            {artist.instagramHandle} · {artist.whatsappNumber}
          </p>
        </div>
      </div>
    </header>
  );
}
