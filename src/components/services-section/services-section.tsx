import { Clock, Layers, Shield, Sparkles } from "lucide-react";

import type { Service } from "./services-section.types";

const services: Service[] = [
  {
    title: "Carillas biomiméticas",
    copy: "Control cromático y texturas calibradas antes de enviar al sillón.",
    icon: <Sparkles className="size-5 text-[var(--accent)]" />,
  },
  {
    title: "Implantología digital",
    copy: "Guías quirúrgicas y estructuras en zirconio con ajuste verificado.",
    icon: <Shield className="size-5 text-[var(--accent)]" />,
  },
  {
    title: "Prótesis flexible",
    copy: "Diseños CAD optimizados para confort y estabilidad funcional.",
    icon: <Layers className="size-5 text-[var(--accent)]" />,
  },
  {
    title: "Soporte a clínicas",
    copy: "Portal para odontólogos con seguimiento en vivo y evidencias.",
    icon: <Clock className="size-5 text-[var(--accent)]" />,
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="mx-auto mt-16 max-w-6xl">
      <div className="frosted-panel rounded-[48px] p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
              Servicios
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              Restauraciones que respetan el plan oclusal, estético y funcional.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Equipos Ivoclar, Programat y flujo CAD/CAM híbrido para responder
            con consistencia clínica.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_25px_55px_rgba(3,24,15,0.08)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--accent)]/15">
                  {service.icon}
                </div>
                <p className="text-base font-semibold text-[var(--foreground)]">
                  {service.title}
                </p>
              </div>
              <p className="text-sm text-muted">{service.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
