import { Loader2, UserPlus2 } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

import { FormFeedback, type FormMessage } from "../form-feedback/form-feedback";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRY_OPTIONS,
  type PhoneCountryCode,
} from "@/constants/phone-country";

export type TechnicianFormState = {
  name: string;
  email: string;
  phoneCountry: PhoneCountryCode;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "worker";
};

type TechnicianFormProps = {
  draft: TechnicianFormState;
  onChange: Dispatch<SetStateAction<TechnicianFormState>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  message: FormMessage;
};

export function TechnicianForm({
  draft,
  onChange,
  onSubmit,
  isSaving,
  message,
}: TechnicianFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_15px_45px_rgba(26,18,11,0.08)]"
    >
      <div className="flex items-center gap-3">
        <UserPlus2 className="size-5 text-[var(--accent)]" />
        <h3 className="text-lg font-semibold">Registrar laboratorista</h3>
      </div>
      <div className="mt-4 space-y-4">
        <label className="flex flex-col text-sm font-medium text-muted">
          Nombre completo
          <input
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={draft.name}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Ej. Ana Morales"
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Correo electrónico
          <input
            type="email"
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={draft.email}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="laboratorio@intechlab.com"
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Teléfono / WhatsApp
          <div className="mt-2 flex gap-2">
            <select
              className="w-20 rounded-2xl border border-black/10 px-2 py-3 focus:border-[var(--accent)] focus:outline-none"
              value={draft.phoneCountry ?? DEFAULT_PHONE_COUNTRY}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  phoneCountry: event.target.value as PhoneCountryCode,
                }))
              }
              required
            >
              {PHONE_COUNTRY_OPTIONS.map((option) => (
                <option
                  key={option.code}
                  value={option.code}
                  title={`${option.label} (${option.code})`}
                >
                  {option.flag}
                </option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              className="flex-1 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
              value={draft.phoneNumber}
              onChange={(event) => {
                const next = event.target.value.replace(/[^\d]/g, "");
                onChange((prev) => ({ ...prev, phoneNumber: next }));
              }}
              placeholder="3001234567"
              required
            />
          </div>
          <span className="mt-1 text-xs text-muted">
            Solo números, 10 dígitos.
          </span>
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Rol en el sistema
          <select
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={draft.role}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                role: event.target.value as TechnicianFormState["role"],
              }))
            }
          >
            <option value="worker">Laboratorista</option>
            <option value="admin">Administrador</option>
          </select>
          <span className="mt-1 text-xs text-muted">
            Los administradores pueden crear casos y gestionar usuarios.
          </span>
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Contraseña temporal
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={draft.password}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Mínimo 6 caracteres"
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Confirmar contraseña
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={draft.confirmPassword}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            required
          />
        </label>
      </div>

      <FormFeedback message={message} />

      <button
        type="submit"
        disabled={isSaving}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-black/30 disabled:opacity-60"
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus2 className="size-4" />
        )}
        {isSaving ? "Guardando" : "Guardar laboratorista"}
      </button>
    </form>
  );
}
