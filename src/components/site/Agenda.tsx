import Link from "next/link";
import { agendaEvents, type AgendaEvent } from "@/lib/site/content";
import { buildWhatsappLink } from "@/lib/site/whatsapp";
import { RevealOnScroll } from "./RevealOnScroll";
import { SectionHeading } from "./SectionHeading";

function EventCard({ event }: { event: AgendaEvent }) {
  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-ink-950 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gold text-ink-950">
          <span className="text-xl font-bold leading-none">{event.day}</span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-widest">{event.month}</span>
        </div>
        <div>
          <h3 className="heading-display text-xl text-white sm:text-2xl">{event.name}</h3>
          <p className="mt-1 text-sm text-ink-300">
            {event.venue} — {event.city}
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">{event.time}</p>
        </div>
      </div>
      <Link
        href={event.href ?? buildWhatsappLink(`Olá, Aragão! Quero saber mais sobre "${event.name}".`)}
        target={event.href ? undefined : "_blank"}
        className="btn-outline shrink-0"
      >
        Saiba mais
      </Link>
    </article>
  );
}

export function Agenda() {
  return (
    <section id="agenda" className="bg-ink-950 py-28 sm:py-32">
      <div className="container-page">
        <RevealOnScroll>
          <SectionHeading eyebrow="Agenda" title="PRÓXIMOS EVENTOS" />
        </RevealOnScroll>

        <div className="mt-14 space-y-4">
          {agendaEvents.length > 0 ? (
            agendaEvents.map((event, i) => (
              <RevealOnScroll key={`${event.name}-${i}`} delay={i * 70}>
                <EventCard event={event} />
              </RevealOnScroll>
            ))
          ) : (
            <RevealOnScroll>
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-8 py-20 text-center">
                <p className="heading-display text-2xl text-white/70 sm:text-3xl">
                  Novas datas em breve.
                </p>
                <p className="mt-3 text-sm text-ink-400">
                  Acompanhe {" "}
                  <a
                    href="https://www.instagram.com/aragaodj"
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold hover:underline"
                  >
                    @aragaodj
                  </a>{" "}
                  para não perder o anúncio da próxima data.
                </p>
              </div>
            </RevealOnScroll>
          )}
        </div>
      </div>
    </section>
  );
}
