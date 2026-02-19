import { Loader2, PlusCircle } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";

import type { NewJobInput } from "@/types/job";
import type { Technician } from "@/types/technician";

import { FormFeedback, type FormMessage } from "../form-feedback/form-feedback";

type CaseFormProps = {
  jobDraft: NewJobInput;
  technicians: Technician[];
  onChange: Dispatch<SetStateAction<NewJobInput>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  message: FormMessage;
};

export function CaseForm({
  jobDraft,
  technicians,
  onChange,
  onSubmit,
  isSaving,
  message,
}: CaseFormProps) {
  const hasRegisteredTechnicians = technicians.some((tech) => tech.email);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(26,18,11,0.08)]"
    >
      <div className="flex items-center gap-3">
        <PlusCircle className="size-5 text-[var(--accent)]" />
        <h2 className="text-xl font-semibold">Registrar nuevo caso</h2>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm font-medium text-muted">
          Paciente
          <input
            className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.patientName}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, patientName: event.target.value }))
            }
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Doctor tratante
          <input
            className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.dentist}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, dentist: event.target.value }))
            }
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted md:col-span-2">
          Detalle del caso
          <input
            className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.treatment}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, treatment: event.target.value }))
            }
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Fecha de llegada
          <input
            type="datetime-local"
            className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.arrivalDate}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, arrivalDate: event.target.value }))
            }
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Fecha de entrega
          <input
            type="datetime-local"
            className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.dueDate}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, dueDate: event.target.value }))
            }
            required
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Técnico asignado
          {hasRegisteredTechnicians ? (
            <select
              className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
              value={jobDraft.assignedTo}
              onChange={(event) => {
                const nextEmail = event.target.value;
                const selected = technicians.find(
                  (tech) => tech.email === nextEmail,
                );
                onChange((prev) => ({
                  ...prev,
                  assignedTo: nextEmail,
                  assignedToName: selected?.name ?? "",
                }));
              }}
              required
            >
              {technicians
                .filter((tech) => tech.email)
                .map((tech) => (
                  <option key={tech.id} value={tech.email}>
                    {tech.name} — {tech.email}
                  </option>
                ))}
            </select>
          ) : (
            <input
              className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
              value={jobDraft.assignedTo}
              type="email"
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  assignedTo: event.target.value,
                  assignedToName: "",
                }))
              }
              placeholder="Ingresa el correo del laboratorista"
              required
            />
          )}
        </label>
        <label className="flex flex-col text-sm font-medium text-muted">
          Prioridad
          <select
            className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.priority}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                priority: event.target.value as NewJobInput["priority"],
              }))
            }
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>
        <label className="flex flex-col text-sm font-medium text-muted md:col-span-2">
          Notas
          <textarea
            className="mt-2 min-h-[120px] rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
            value={jobDraft.notes}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </label>
      </div>

      <FormFeedback message={message} />

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-3 text-base font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
      >
        {isSaving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <PlusCircle className="size-4" />
        )}
        {isSaving ? "Guardando" : "Registrar caso"}
      </button>
    </form>
  );
}
