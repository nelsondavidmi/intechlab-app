import { MessageCircle } from "lucide-react";

import { ContactForm } from "../contact-form";
import type { WorkflowStep } from "./contact-section.types";

const workflow: WorkflowStep[] = [
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

export function ContactSection() {
  return (
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
      <ContactForm />
    </section>
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
