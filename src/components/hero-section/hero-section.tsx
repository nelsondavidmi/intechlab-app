import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { BoardCard, Stat } from "./hero-section.types";

const stats: Stat[] = [
  { value: "+15", label: "años en restauraciones" },
  { value: "24h", label: "prototipos expres" },
  { value: "98%", label: "casos aprobados a la primera" },
];

const mockBoard: BoardCard[] = [
  {
    id: "case-01",
    patient: "Andrea Tapia",
    treatment: "Carillas 11-21",
    dentist: "Dr. Contreras",
    due: "3h restantes",
    badge: "Prioridad Alta",
    badgeClass:
      "inline-flex items-center rounded-full bg-[#e0fff4] px-3 py-1 text-xs font-semibold text-[#0c8a62]",
  },
  {
    id: "case-02",
    patient: "Marcelo Fuentes",
    treatment: "Corona Zirconio",
    dentist: "Dra. Ugarte",
    due: "Mañana 10:00",
    badge: "Ajuste clínico",
    badgeClass:
      "inline-flex items-center rounded-full bg-[#e3f2ff] px-3 py-1 text-xs font-semibold text-[#1e50a2]",
  },
  {
    id: "case-03",
    patient: "Paula Rosas",
    treatment: "Prótesis flexible",
    dentist: "Dr. Quintero",
    due: "Listo para envío",
    badge: "Calidad OK",
    badgeClass:
      "inline-flex items-center rounded-full bg-[#fff4dc] px-3 py-1 text-xs font-semibold text-[#a86500]",
  },
];

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="mx-auto flex max-w-6xl flex-col gap-10 rounded-[48px] bg-white/70 p-8 shadow-[0_40px_80px_rgba(3,24,15,0.08)] lg:flex-row"
    >
      <div className="flex flex-1 flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent)]/10 px-4 py-1 text-sm font-semibold text-[var(--accent-dark)]">
          Laboratorio boutique digital
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
          <div className="hero-inner space-y-4 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
              Operativa en vivo
            </p>
            {mockBoard.map((card) => (
              <div key={card.id} className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold">{card.patient}</p>
                  <span className={card.badgeClass}>{card.badge}</span>
                </div>
                <p className="text-sm text-white/70">{card.treatment}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                  <span>{card.dentist}</span>
                  <span>{card.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
