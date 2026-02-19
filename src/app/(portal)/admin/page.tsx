"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CaseForm, TechnicianForm, TechniciansList } from "@/components/admin";
import { PortalShell } from "@/components/dashboard";
import { useJobs } from "@/hooks/use-jobs";
import { useTechnicians } from "@/hooks/use-technicians";
import { createJob } from "@/lib/jobs/mutations";
import { useAuth } from "@/providers/auth-provider";
import type { NewJobInput } from "@/types/job";
import type { FormMessage, TechnicianFormState } from "@/components/admin";

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
  const [message, setMessage] = useState<FormMessage>(null);
  const [technicianDraft, setTechnicianDraft] =
    useState<TechnicianFormState>(defaultTechnician);
  const [isSavingTechnician, setIsSavingTechnician] = useState(false);
  const [technicianMessage, setTechnicianMessage] = useState<FormMessage>(null);
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
    <PortalShell maxWidthClass="max-w-6xl" contentClassName="bg-white/85">
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
        <CaseForm
          jobDraft={jobDraft}
          technicians={technicians}
          onChange={setJobDraft}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          message={message}
        />

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

          <TechnicianForm
            draft={technicianDraft}
            onChange={setTechnicianDraft}
            onSubmit={handleTechnicianSubmit}
            isSaving={isSavingTechnician}
            message={technicianMessage}
          />

          <TechniciansList
            technicians={technicians}
            loading={techniciansLoading}
            deletingId={deletingTechnicianId}
            onDelete={handleDeleteTechnician}
          />
        </div>
      </section>
    </PortalShell>
  );
}
