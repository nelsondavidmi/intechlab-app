import { CheckCircle2 } from "lucide-react";

import type { Plan } from "./pricing-section.types";

const pricing: Plan[] = [
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

export function PricingSection() {
  return (
    <section
      id="precios"
      className="scroll-mt-28 lg:scroll-mt-36 mx-auto mt-16 max-w-6xl"
    >
      <div className="mb-8 flex flex-col gap-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
          Precios claros
        </p>
        <h2 className="text-3xl font-semibold text-[var(--foreground)]">
          Tarifario base con entregas garantizadas.
        </h2>
        <p className="text-base text-muted">
          Incluye evidencia fotográfica, control de calidad interno y soporte
          post-entrega.
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
  );
}
