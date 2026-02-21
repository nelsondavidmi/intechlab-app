import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Stat } from "./hero-section.types";

const stats: Stat[] = [
  { value: "+15", label: "años de experiencia" },
  { value: "98%", label: "casos aprobados a la primera" },
];

const galleryImages = [
  {
    id: "gallery-01",
    src: "/ref1.jpg",
    caption: "Carillas en curso",
  },
  {
    id: "gallery-02",
    src: "/ref2.jpg",
    caption: "Rehabilitacion total",
  },
  {
    id: "gallery-03",
    src: "/ref3.jpg",
    caption: "Detalles ceramicos",
  },
  {
    id: "gallery-04",
    src: "/ref4.jpg",
    caption: "Sonrisa final",
  },
] as const;

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="scroll-mt-28 lg:scroll-mt-36 mx-auto flex max-w-6xl flex-col gap-10 rounded-[48px] bg-white/70 p-8 shadow-[0_40px_80px_rgba(3,24,15,0.08)] lg:flex-row"
    >
      <div className="flex flex-1 flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)]/10 px-4 py-1 text-sm font-semibold text-[var(--accent-dark)]">
          Laboratorio dental
        </span>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
          Estética y función para cada caso clínico.
        </h1>
        <p className="text-lg text-muted">
          Diseñamos restauraciones que respetan el plan del odontólogo y llegan
          con evidencia fotográfica, checklist y soporte inmediato.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="#precios"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
          >
            Ver precios
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="#contacto"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-base font-semibold text-[var(--foreground)] hover:border-black/25"
          >
            Agenda una llamada
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-5 pt-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold text-[var(--foreground)]">
                {stat.value}
              </p>
              <p className="text-sm uppercase tracking-[0.2em] text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="hero-frame">
          <div className="hero-inner space-y-4 text-[var(--foreground)]">
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.map((item) => (
                <figure
                  key={item.id}
                  className="relative overflow-hidden rounded-[32px] border border-black/5 bg-white/80"
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-[0.5rem] font-semibold uppercase leading-snug tracking-[0.08em] text-white whitespace-normal break-words sm:px-4 sm:pb-4 sm:pt-10 sm:text-[0.7rem] sm:tracking-[0.2em]">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
