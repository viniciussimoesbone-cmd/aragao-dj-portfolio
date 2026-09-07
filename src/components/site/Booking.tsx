"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { artist, eventTypes } from "@/lib/site/content";
import { buildWhatsappLink } from "@/lib/site/whatsapp";
import { IconArrowRight, IconWhatsapp } from "./Icons";
import { RevealOnScroll } from "./RevealOnScroll";

type FormState = {
  nome: string;
  whatsapp: string;
  tipoEvento: string;
  dataEvento: string;
  cidade: string;
  mensagem: string;
};

const initialState: FormState = {
  nome: "",
  whatsapp: "",
  tipoEvento: eventTypes[0],
  dataEvento: "",
  cidade: "",
  mensagem: "",
};

export function Booking() {
  const [form, setForm] = useState<FormState>(initialState);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = [
      "Olá, Aragão! Vim pelo site e gostaria de solicitar um orçamento.",
      "",
      `Nome: ${form.nome}`,
      `WhatsApp: ${form.whatsapp}`,
      `Tipo de evento: ${form.tipoEvento}`,
      form.dataEvento && `Data do evento: ${form.dataEvento}`,
      `Cidade: ${form.cidade}`,
      form.mensagem && `Mensagem: ${form.mensagem}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(buildWhatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contato" className="relative overflow-hidden bg-ink-950 py-28 sm:py-32">
      <div
        className="absolute inset-0 [background:radial-gradient(70%_60%_at_50%_0%,rgba(201,162,75,0.22),transparent_65%)]"
        aria-hidden
      />

      <div className="container-page relative">
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Contratação</p>
          <h2 className="heading-display mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
            VAMOS CRIAR O PRÓXIMO EVENTO?
          </h2>
          <p className="mt-5 text-lg text-ink-200">Leve a experiência do Aragão para o seu evento.</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href={buildWhatsappLink()} target="_blank" rel="noreferrer" className="btn-primary">
              Solicitar orçamento
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href={buildWhatsappLink()} target="_blank" rel="noreferrer" className="btn-outline">
              <IconWhatsapp className="h-4 w-4" />
              Fale pelo WhatsApp
            </Link>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={120} className="mx-auto mt-16 max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm sm:grid-cols-2 sm:p-9"
          >
            <Field label="Nome" required>
              <input
                required
                type="text"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                className="field"
                placeholder="Seu nome"
              />
            </Field>

            <Field label="WhatsApp" required>
              <input
                required
                type="tel"
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="field"
                placeholder="(00) 00000-0000"
              />
            </Field>

            <Field label="Tipo de evento" required>
              <select
                value={form.tipoEvento}
                onChange={(e) => handleChange("tipoEvento", e.target.value)}
                className="field"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type} className="bg-ink-900">
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Data do evento">
              <input
                type="date"
                value={form.dataEvento}
                onChange={(e) => handleChange("dataEvento", e.target.value)}
                className="field"
              />
            </Field>

            <Field label="Cidade" required className="sm:col-span-2">
              <input
                required
                type="text"
                value={form.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                className="field"
                placeholder="Sua cidade"
              />
            </Field>

            <Field label="Mensagem" className="sm:col-span-2">
              <textarea
                value={form.mensagem}
                onChange={(e) => handleChange("mensagem", e.target.value)}
                className="field min-h-28 resize-none"
                placeholder="Conte um pouco sobre o evento"
              />
            </Field>

            <button type="submit" className="btn-primary sm:col-span-2">
              Enviar solicitação
              <IconArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-xs text-ink-400 sm:col-span-2">
              Ao enviar, você será direcionado ao WhatsApp do Aragão com os dados preenchidos.
            </p>
          </form>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="text-xs font-semibold uppercase tracking-widest text-ink-400">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      {children}
    </label>
  );
}
