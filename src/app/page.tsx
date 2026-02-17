import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  Layers,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const highlights = [
  {
    label: "Tiempos controlados",
    value: "24h",
    detail: "promedio prototipos impresos",
  },
  { label: "Casos al mes", value: "480+", detail: "labor fijo y removible" },
  { label: "Dentistas activos", value: "65", detail: "en el ecosistema" },
];

const services = [
  {
    title: "Diseño CAD personalizado",
    copy: "Flujos digitales híbridos con validaciones en tiempo real para el odontólogo.",
  },
  {
    title: "Producción cerámica premium",
    copy: "Hornos Programat y materiales Ivoclar de última generación.",
  },
  {
    title: "Control de calidad clínico",
    copy: "Checklist fotográfico y trazabilidad de cada fase del caso.",
  },
];

const workflow = [
  {
    title: "Ingreso inteligente",
    detail: "El odontólogo carga archivos y especificaciones desde su portal.",
    icon: <Layers className="size-5 text-white" />,
  },
  {
    title: "Asignación automática",
    detail: "El sistema distribuye por especialidad, carga y SLA.",
    icon: <Users className="size-5 text-white" />,
  },
  {
    title: "Seguimiento vivo",
    detail: "Dashboard de técnicos con prioridades y bloqueos visibles.",
    icon: <Clock className="size-5 text-white" />,
  },
  {
    title: "Entrega y feedback",
    detail: "Confirmación, documentación y métricas para mejora continua.",
    icon: <Shield className="size-5 text-white" />,
  },
];

export default function Home() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <section className="grid-mask relative mx-auto grid max-w-6xl grid-cols-1 gap-10 rounded-4xl border border-white/60 bg-white/80 px-8 py-10 shadow-[0_25px_90px_rgba(26,18,11,0.08)] backdrop-blur-lg lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-1 text-sm font-medium text-muted">
            <Sparkles className="size-4 text-[var(--accent)]" />
            Laboratorio dental digital
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
            Diseñamos y producimos restauraciones que llegan listas para
            cementar.
          </h1>
          <p className="text-lg text-muted">
            IntechLab combina flujo CAD/CAM, control de calidad clínico y un
            portal operativo donde cada trabajo tiene responsable, estatus y
            fecha comprometida.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              Entrar al portal
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#agenda-demo"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 px-6 py-3 text-base font-semibold text-[var(--foreground)] hover:border-black/30"
            >
              Agenda una demo
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-black/10 pt-6">
            {highlights.map((item) => (
              <div key={item.label}>
                <p className="text-sm uppercase tracking-wide text-muted">
                  {item.label}
                </p>
                <p className="text-3xl font-semibold text-[var(--foreground)]">
                  {item.value}
                </p>
                <p className="text-sm text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl bg-[var(--card)] p-6">
          <div className="mb-6 flex items-center justify-between text-sm text-muted">
            <span className="inline-flex items-center gap-2 font-medium">
              <Calendar className="size-4 text-[var(--accent)]" />
              Producción de hoy
            </span>
            <span>Dashboard técnico</span>
          </div>
          <div className="space-y-4">
            {mockBoard.map((card) => (
              <div
                key={card.id}
                className="glow rounded-2xl border border-white/60 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {card.patient}
                  </p>
                  <span className={card.badgeClass}>{card.badge}</span>
                </div>
                <p className="text-sm text-muted">{card.treatment}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <span>{card.dentist}</span>
                  <span>{card.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="rounded-4xl border border-black/10 bg-white/70 p-8 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                Servicios clave
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                Un laboratorio pensado para clínicas digitales.
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
            >
              Ver demo del dashboard
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_20px_45px_rgba(26,18,11,0.06)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--accent-dark)]">
                  {service.title}
                </p>
                <p className="mt-4 text-base text-muted">{service.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-8 rounded-4xl border border-black/10 bg-[#0f0a07] px-8 py-12 text-white lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            Flujo operativo
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight">
            Portal para odontólogos + tablero interno para técnicos e
            ingeniería.
          </h2>
          <p className="mt-4 text-base text-white/80">
            Cada rol tiene visibilidad granular: casos bloqueados, entregas
            críticas, notas multimedia y aprobaciones.
          </p>
          <Link
            id="agenda-demo"
            href="mailto:hola@intechlab.com?subject=Quiero%20una%20demo"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
          >
            Escribe al equipo comercial
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {workflow.map((step) => (
            <div
              key={step.title}
              className="flex gap-4 rounded-3xl border border-white/20 bg-white/5 p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/15">
                {step.icon}
              </div>
              <div>
                <p className="text-base font-semibold">{step.title}</p>
                <p className="text-sm text-white/70">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const mockBoard = [
  {
    id: "case-01",
    patient: "Andrea Tapia",
    treatment: "Carillas 11-21",
    dentist: "Dr. Contreras",
    due: "3h restantes",
    badge: "Prioridad Alta",
    badgeClass:
      "inline-flex items-center rounded-full bg-[#ffe4dc] px-3 py-1 text-xs font-semibold text-[var(--accent-dark)]",
  },
  {
    id: "case-02",
    patient: "Marcelo Fuentes",
    treatment: "Corona Zirconio",
    dentist: "Dra. Ugarte",
    due: "Mañana 10:00",
    badge: "Ajuste clínico",
    badgeClass:
      "inline-flex items-center rounded-full bg-[#dff3e3] px-3 py-1 text-xs font-semibold text-[#1f8f58]",
  },
  {
    id: "case-03",
    patient: "Paula Rosas",
    treatment: "Prótesis flexible",
    dentist: "Dr. Quintero",
    due: "Listo para envío",
    badge: "Calidad OK",
    badgeClass:
      "inline-flex items-center rounded-full bg-[#dfe9ff] px-3 py-1 text-xs font-semibold text-[#244cdd]",
  },
];
