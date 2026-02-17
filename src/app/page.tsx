import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  MessageCircle,
  Shield,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Precios", href: "#precios" },
  { label: "Contáctanos", href: "#contacto" },
];

const stats = [
  { value: "+15", label: "años en restauraciones" },
  { value: "24h", label: "prototipos expres" },
  { value: "98%", label: "casos aprobados a la primera" },
];

const services = [
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

const pricing = [
  {
    name: "Carillas",
    price: "USD 180",
    description: "Carillas cerámicas estratificadas + prueba mock-up.",
    include: [
      "Mock-up digital",
      "Fotogrametría de tono",
      "Entrega express opcional",
    ],
  },
  {
    name: "Coronas Zirconio",
    price: "USD 140",
    description: "Monolíticas o estratificadas, ajuste oclusal garantizado.",
    highlight: true,
    include: [
      "Reporte de contactos",
      "Control de pigmentos",
      "Garantía 3 años",
    ],
  },
  {
    name: "Prótesis flexible",
    price: "USD 95",
    description: "Base flexible con ganchería estética y entrega fotográfica.",
    include: [
      "Diseño CAD",
      "Plan de mantenimiento",
      "Materiales hipoalergénicos",
    ],
  },
];

const workflow = [
  {
    title: "Ingreso visual",
    detail: "Recibimos fotos, escaneos y receta con checklist guiado.",
  },
  {
    title: "Producción",
    detail: "Asignamos técnicos según complejidad y SLA comprometido.",
  },
  {
    title: "Control y envío",
    detail: "Documentamos acabado, empaquetamos y notificamos al odontólogo.",
  },
];

const mockBoard = [
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

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="#inicio" className="flex items-center gap-4">
            <Image
              src="/intechlab-logo-app.png"
              alt="intechlab logo"
              width={180}
              height={48}
              className="h-10 w-auto"
              priority
            />
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.45em] text-[var(--accent-dark)]">
                Estética y función
              </p>
              <p className="text-sm text-muted">Laboratorio dental</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="hidden rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-dark)] md:inline-flex"
          >
            Portal interno
          </Link>
        </div>
      </header>

      <main className="px-6 py-14 sm:px-10 lg:px-16">
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
              Diseñamos restauraciones que respetan el plan del odontólogo y
              llegan con evidencia fotográfica, checklist y soporte inmediato.
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

        <section id="servicios" className="mx-auto mt-16 max-w-6xl">
          <div className="frosted-panel rounded-[48px] p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
                  Servicios
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                  Restauraciones que respetan el plan oclusal, estético y
                  funcional.
                </h2>
              </div>
              <p className="max-w-sm text-sm text-muted">
                Equipos Ivoclar, Programat y flujo CAD/CAM híbrido para
                responder con consistencia clínica.
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

        <section id="precios" className="mx-auto mt-16 max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
              Precios claros
            </p>
            <h2 className="text-3xl font-semibold text-[var(--foreground)]">
              Tarifario base con entregas garantizadas.
            </h2>
            <p className="text-base text-muted">
              Incluye evidencia fotográfica, control de calidad interno y
              soporte post-entrega.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-3xl border border-black/5 bg-white p-6 shadow-[0_25px_60px_rgba(3,24,15,0.08)] ${plan.highlight ? "ring-2 ring-[var(--accent)]" : ""}`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl font-semibold text-[var(--foreground)]">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]">
                  {plan.include.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contacto"
          className="mx-auto mt-16 grid max-w-6xl gap-6 rounded-[48px] border border-black/5 bg-white/80 p-8 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
              Contáctanos
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
              Programa una demo o agenda tus próximos casos.
            </h2>
            <div className="mt-8 space-y-4 text-base text-muted">
              <p className="flex items-center gap-3">
                <MessageCircle className="size-5 text-[var(--accent)]" />
                hola@intechlab.com
              </p>
              <p className="flex items-center gap-3">
                <PhoneIcon />
                +51 999 123 456
              </p>
            </div>
            <div className="mt-8 grid gap-4 text-sm text-muted sm:grid-cols-3">
              {workflow.map((step) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-black/5 p-4"
                >
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {step.title}
                  </p>
                  <p>{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <form className="rounded-3xl bg-[var(--foreground)]/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
              Escríbenos
            </p>
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Nombre y clínica
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Dra. Sofía - Clínica Atlas"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Email de contacto
                <input
                  className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="correo@clinica.com"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Mensaje
                <textarea
                  className="mt-2 min-h-[120px] w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Cuéntanos sobre tu caso"
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-[var(--accent)] py-3 text-base font-semibold text-white"
            >
              Enviar solicitud
            </button>
          </form>
        </section>
      </main>

      <a
        href="https://wa.me/573104413239"
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
        aria-label="Escríbenos por WhatsApp"
      >
        WA
      </a>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-5 text-[var(--accent)]"
    >
      <path d="M6.5 2.5H9l2 4-2 1a12 12 0 006 6l1-2 4 2v2.5a2 2 0 01-2 2 16 16 0 01-14-14 2 2 0 012-2z" />
    </svg>
  );
}
