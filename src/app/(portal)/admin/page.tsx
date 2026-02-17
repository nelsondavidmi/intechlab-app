"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useJobs } from "@/hooks/useJobs";
import { createJob } from "@/lib/jobs/mutations";
import type { NewJobInput } from "@/types/job";
import { AlertTriangle, CheckCircle2, Loader2, PlusCircle } from "lucide-react";

const defaultJob: NewJobInput = {
  patientName: "",
  treatment: "",
  dentist: "",
  dueDate: new Date().toISOString().slice(0, 16),
  assignedTo: "",
  priority: "media",
  notes: "",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const [jobDraft, setJobDraft] = useState(defaultJob);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <PortalShell>
        <p className="text-muted">Verificando credenciales...</p>
      </PortalShell>
    );
  }

  if (!isAdmin) {
    return (
      <PortalShell>
        <div className="rounded-3xl bg-[#fff0e8] p-6 text-[var(--accent-dark)]">
          <p className="text-base font-semibold">
            Necesitas rol administrador.
          </p>
          <p className="text-sm">
            Solicita que tu usuario reciba el claim{" "}
            <strong>role = admin</strong> en Firebase Auth.
          </p>
        </div>
      </PortalShell>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await createJob(jobDraft);
      setJobDraft({ ...defaultJob, dueDate: jobDraft.dueDate });
      setMessage({ type: "success", text: "Trabajo registrado." });
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PortalShell>
      <header className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted">
            Control diario
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            Administración de trabajos
          </h1>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-[var(--foreground)]"
        >
          Volver al dashboard
        </button>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_20px_60px_rgba(26,18,11,0.08)]"
        >
          <div className="flex items-center gap-3">
            <PlusCircle className="size-5 text-[var(--accent)]" />
            <h2 className="text-xl font-semibold">Crear nuevo trabajo</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-muted">
              Paciente
              <input
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.patientName}
                onChange={(event) =>
                  setJobDraft((prev) => ({
                    ...prev,
                    patientName: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-muted">
              Dentista
              <input
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.dentist}
                onChange={(event) =>
                  setJobDraft((prev) => ({
                    ...prev,
                    dentist: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-muted md:col-span-2">
              Tratamiento
              <input
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.treatment}
                onChange={(event) =>
                  setJobDraft((prev) => ({
                    ...prev,
                    treatment: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-muted">
              Fecha compromiso
              <input
                type="datetime-local"
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.dueDate}
                onChange={(event) =>
                  setJobDraft((prev) => ({
                    ...prev,
                    dueDate: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-muted">
              Técnico asignado
              <input
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.assignedTo}
                onChange={(event) =>
                  setJobDraft((prev) => ({
                    ...prev,
                    assignedTo: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-muted">
              Prioridad
              <select
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.priority}
                onChange={(event) =>
                  setJobDraft((prev) => ({
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
                  setJobDraft((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          {message && (
            <p
              className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-[#e9f6ee] text-[#1f8f58]"
                  : "bg-[#ffe6e0] text-[#c0392b]"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <AlertTriangle className="size-4" />
              )}
              {message.text}
            </p>
          )}
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
            {isSaving ? "Guardando" : "Registrar trabajo"}
          </button>
        </form>

        <article className="rounded-3xl border border-black/10 bg-white/70 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Estado global
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {jobsLoading
              ? "Sincronizando..."
              : `${jobs.length} trabajos activos`}
          </h3>
          {!jobsLoading && (
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                Pendientes:{" "}
                {jobs.filter((job) => job.status === "pendiente").length}
              </li>
              <li>
                En proceso:{" "}
                {jobs.filter((job) => job.status === "en-proceso").length}
              </li>
              <li>
                Listos: {jobs.filter((job) => job.status === "listo").length}
              </li>
            </ul>
          )}
        </article>
      </section>
    </PortalShell>
  );
}

function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-4xl border border-black/10 bg-white/85 p-8 shadow-[0_30px_80px_rgba(26,18,11,0.1)]">
        {children}
      </div>
    </main>
  );
}
