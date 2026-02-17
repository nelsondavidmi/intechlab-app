"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

const WHATSAPP_URL = "https://wa.me/573104413239";

export function ContactForm() {
  const [formValues, setFormValues] = useState({
    nameClinic: "",
    email: "",
    message: "",
  });

  const handleChange =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const canSend =
    formValues.nameClinic.trim().length > 0 &&
    formValues.email.trim().length > 0 &&
    formValues.message.trim().length > 0;

  const buildMessage = () =>
    `Hola, soy ${formValues.nameClinic.trim()} (${formValues.email.trim()}). ${formValues.message.trim()}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;

    const url = `${WHATSAPP_URL}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form
      className="rounded-3xl bg-[var(--foreground)]/5 p-6"
      onSubmit={handleSubmit}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
        Escríbenos
      </p>
      <div className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Nombre y clínica
          <input
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            placeholder="Dra. Sofía - Clínica Atlas"
            value={formValues.nameClinic}
            onChange={handleChange("nameClinic")}
            required
          />
        </label>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Email de contacto
          <input
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            placeholder="correo@clinica.com"
            type="email"
            value={formValues.email}
            onChange={handleChange("email")}
            required
          />
        </label>
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Mensaje
          <textarea
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            placeholder="Cuéntanos sobre tu caso"
            value={formValues.message}
            onChange={handleChange("message")}
            required
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-5 w-full rounded-2xl bg-[var(--accent)] py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[var(--accent)]/40"
        disabled={!canSend}
      >
        Enviar por WhatsApp
      </button>
      <p className="mt-3 text-center text-xs text-muted">
        Se abrirá WhatsApp Web con tu mensaje prellenado.
      </p>
    </form>
  );
}
