"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useJobs } from "@/hooks/use-jobs";
import { useTechnicians } from "@/hooks/use-technicians";
import { createJob } from "@/lib/jobs/mutations";
import type { NewJobInput } from "@/types/job";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PlusCircle,
  UserPlus2,
  UsersRound,
  Trash2,
} from "lucide-react";

const dateInputValue = (value: Date) => value.toISOString().slice(0, 16);

const defaultJob: NewJobInput = {
  patientName: "",
  treatment: "",
  dentist: "",
  arrivalDate: dateInputValue(new Date()),
  dueDate: dateInputValue(new Date(Date.now() + 2 * 86400000)),
  assignedTo: "",
  assignedToName: "",
  priority: "media",
  notes: "",
};

type TechnicianFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "worker";
};

const defaultTechnician: TechnicianFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "worker",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin, token } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const [jobDraft, setJobDraft] = useState(defaultJob);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [technicianDraft, setTechnicianDraft] =
    useState<TechnicianFormState>(defaultTechnician);
  const [isSavingTechnician, setIsSavingTechnician] = useState(false);
  const [technicianMessage, setTechnicianMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deletingTechnicianId, setDeletingTechnicianId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    const firstWithEmail = technicians.find((tech) => tech.email);
    if (!firstWithEmail) return;
    setJobDraft((prev) => {
      if (prev.assignedTo) return prev;
      return {
        ...prev,
        assignedTo: firstWithEmail.email,
        assignedToName: firstWithEmail.name,
      };
    });
  }, [technicians]);

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
      setJobDraft((prev) => ({
        ...defaultJob,
        arrivalDate: prev.arrivalDate,
        dueDate: prev.dueDate,
        assignedTo: prev.assignedTo,
        assignedToName: prev.assignedToName,
      }));
      setMessage({ type: "success", text: "Caso registrado." });
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTechnicianSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!technicianDraft.email || !technicianDraft.password) {
      setTechnicianMessage({
        type: "error",
        text: "Correo y contraseña temporal son obligatorios.",
      });
      return;
    }

    if (technicianDraft.password !== technicianDraft.confirmPassword) {
      setTechnicianMessage({
        type: "error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    const adminToken = token?.token;

    if (!adminToken) {
      setTechnicianMessage({
        type: "error",
        text: "Sesión inválida. Vuelve a iniciar sesión como administrador.",
      });
      return;
    }

    setIsSavingTechnician(true);
    setTechnicianMessage(null);

    try {
      const response = await fetch("/api/technicians", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: technicianDraft.name,
          email: technicianDraft.email,
          phone: technicianDraft.phone || undefined,
          password: technicianDraft.password,
          role: technicianDraft.role,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? "No se pudo registrar al laboratorista.",
        );
      }

      const confirmedEmail = technicianDraft.email;
      setTechnicianDraft(defaultTechnician);
      setTechnicianMessage({
        type: "success",
        text: `Laboratorista registrado. Comparte las credenciales con ${confirmedEmail}.`,
      });
    } catch (error) {
      setTechnicianMessage({ type: "error", text: (error as Error).message });
    } finally {
      setIsSavingTechnician(false);
    }
  }

  async function handleDeleteTechnician(technicianId: string) {
    const target = technicians.find((tech) => tech.id === technicianId);
    if (!target) return;

    const confirmed = window.confirm(
      `¿Eliminar a ${target.name} (${target.email})? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    const adminToken = token?.token;

    if (!adminToken) {
      setTechnicianMessage({
        type: "error",
        text: "Sesión inválida. Vuelve a iniciar sesión como administrador.",
      });
      return;
    }

    setDeletingTechnicianId(technicianId);
    setTechnicianMessage(null);

    try {
      const response = await fetch("/api/technicians", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ uid: technicianId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? "No se pudo eliminar al laboratorista.",
        );
      }

      setTechnicianMessage({
        type: "success",
        text: `${target.name} fue eliminado del equipo.`,
      });
    } catch (error) {
      setTechnicianMessage({ type: "error", text: (error as Error).message });
    } finally {
      setDeletingTechnicianId(null);
    }
  }

  return (
    <PortalShell>
      <header className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted">
            Seguimiento de casos
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            Administración de casos
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
            <h2 className="text-xl font-semibold">Registrar nuevo caso</h2>
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
              Doctor tratante
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
              Detalle del caso
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
              Fecha de llegada
              <input
                type="datetime-local"
                className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                value={jobDraft.arrivalDate}
                onChange={(event) =>
                  setJobDraft((prev) => ({
                    ...prev,
                    arrivalDate: event.target.value,
                  }))
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
              {technicians.some((tech) => tech.email) ? (
                <select
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={jobDraft.assignedTo}
                  onChange={(event) => {
                    const nextEmail = event.target.value;
                    const selected = technicians.find(
                      (tech) => tech.email === nextEmail,
                    );
                    setJobDraft((prev) => ({
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
                    setJobDraft((prev) => ({
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
            {isSaving ? "Guardando" : "Registrar caso"}
          </button>
        </form>

        <div className="space-y-6">
          <article className="rounded-3xl border border-black/10 bg-white/70 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">
              Estado global
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {jobsLoading
                ? "Sincronizando..."
                : `${jobs.length} casos activos`}
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

          <form
            onSubmit={handleTechnicianSubmit}
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
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={technicianDraft.name}
                  onChange={(event) =>
                    setTechnicianDraft((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ej. Ana Morales"
                  required
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-muted">
                Correo electrónico
                <input
                  type="email"
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={technicianDraft.email}
                  onChange={(event) =>
                    setTechnicianDraft((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  placeholder="laboratorio@intechlab.com"
                  required
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-muted">
                Teléfono / WhatsApp
                <input
                  type="tel"
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={technicianDraft.phone}
                  onChange={(event) =>
                    setTechnicianDraft((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+51 900 000 000"
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-muted">
                Rol en el sistema
                <select
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={technicianDraft.role}
                  onChange={(event) =>
                    setTechnicianDraft((prev) => ({
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
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={technicianDraft.password}
                  onChange={(event) =>
                    setTechnicianDraft((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-muted">
                Confirmar contraseña
                <input
                  type="password"
                  className="mt-2 rounded-2xl border border-black/10 px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  value={technicianDraft.confirmPassword}
                  onChange={(event) =>
                    setTechnicianDraft((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>
            {technicianMessage && (
              <p
                className={`mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
                  technicianMessage.type === "success"
                    ? "bg-[#e9f6ee] text-[#1f8f58]"
                    : "bg-[#ffe6e0] text-[#c0392b]"
                }`}
              >
                {technicianMessage.type === "success" ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertTriangle className="size-4" />
                )}
                {technicianMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={isSavingTechnician}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-black/30 disabled:opacity-60"
            >
              {isSavingTechnician ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus2 className="size-4" />
              )}
              {isSavingTechnician ? "Guardando" : "Guardar laboratorista"}
            </button>
          </form>

          <article className="rounded-3xl border border-black/10 bg-white/80 p-6">
            <div className="flex items-center gap-3">
              <UsersRound className="size-5 text-[var(--accent-dark)]" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted">
                  Equipo registrado
                </p>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  {technicians.length} laboratoristas
                </h3>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {techniciansLoading ? (
                <p>Cargando lista...</p>
              ) : technicians.length ? (
                <ul className="space-y-3">
                  {technicians.map((tech) => (
                    <li
                      key={tech.id}
                      className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {tech.name}
                          </p>
                          <p className="text-xs text-muted">
                            {tech.email ?? "Sin correo registrado"}
                          </p>
                          <p className="text-xs text-muted">
                            Rol:{" "}
                            {tech.role === "admin"
                              ? "Administrador"
                              : "Laboratorista"}
                          </p>
                          {tech.phone && (
                            <p className="text-xs text-muted">
                              Tel: {tech.phone}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTechnician(tech.id)}
                          disabled={deletingTechnicianId === tech.id}
                          className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-[#c0392b] hover:text-[#c0392b] disabled:opacity-60"
                        >
                          {deletingTechnicianId === tech.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          {deletingTechnicianId === tech.id
                            ? "Eliminando"
                            : "Eliminar"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  Aún no registras laboratoristas. Usa el formulario para añadir
                  el primero.
                </p>
              )}
            </div>
          </article>
        </div>
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
