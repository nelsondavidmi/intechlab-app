"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AdminSummaryPanel,
  AdminTabsNav,
  CaseForm,
  DentistForm,
  DentistsList,
  TechnicianForm,
  TechniciansList,
} from "@/components/admin";
import type { FormMessage } from "@/components/admin";
import { PortalShell, VerifySession } from "@/components/dashboard";
import { JOB_STATUS } from "@/constants";
import { useJobs } from "@/hooks/use-jobs";
import { useTechnicians } from "@/hooks/use-technicians";
import { useDentists } from "@/hooks/use-dentists";
import { createJob } from "@/lib/jobs/mutations";
import { useAuth } from "@/providers/auth-provider";
import { formatContactLabel } from "@/utils/format-contact-label";

import {
  ADMIN_TABS,
  DEFAULT_DENTIST,
  DEFAULT_JOB,
  DEFAULT_TECHNICIAN,
} from "./admin.constants";
import {
  exportCasesReport,
  exportDentistsDirectory,
  exportTechniciansDirectory,
} from "./admin-exporters";
import type { AdminTab, ExportScope, StatusSummary } from "./admin.types";
import {
  buildPhoneNumber,
  isValidEmail,
  phoneErrorMessage,
} from "./admin.utils";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin, token } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { dentists, loading: dentistsLoading } = useDentists();
  const [jobDraft, setJobDraft] = useState(DEFAULT_JOB);
  const [activeTab, setActiveTab] = useState<AdminTab>("cases");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);
  const [technicianDraft, setTechnicianDraft] = useState(DEFAULT_TECHNICIAN);
  const [isSavingTechnician, setIsSavingTechnician] = useState(false);
  const [technicianMessage, setTechnicianMessage] = useState<FormMessage>(null);
  const [deletingTechnicianId, setDeletingTechnicianId] = useState<
    string | null
  >(null);
  const [dentistDraft, setDentistDraft] = useState(DEFAULT_DENTIST);
  const [isSavingDentist, setIsSavingDentist] = useState(false);
  const [dentistMessage, setDentistMessage] = useState<FormMessage>(null);
  const [deletingDentistId, setDeletingDentistId] = useState<string | null>(
    null,
  );
  const [isExportingCases, setIsExportingCases] = useState(false);
  const [isExportingTechnicians, setIsExportingTechnicians] = useState(false);
  const [isExportingDentists, setIsExportingDentists] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{
    scope: ExportScope;
    message: Exclude<FormMessage, null>;
  } | null>(null);
  const adminName =
    user?.displayName?.split(" ")[0] ??
    user?.displayName ??
    user?.email ??
    "administrador";
  const statusSummary = useMemo<StatusSummary>(() => {
    const summary = {
      total: jobs.length,
      pending: 0,
      inProgress: 0,
      ready: 0,
      delivered: 0,
    };

    return jobs.reduce((acc, job) => {
      if (job.status === JOB_STATUS.PENDING) acc.pending += 1;
      if (job.status === JOB_STATUS.IN_PROGRESS) acc.inProgress += 1;
      if (job.status === JOB_STATUS.READY) acc.ready += 1;
      if (job.status === JOB_STATUS.DELIVERED) acc.delivered += 1;
      return acc;
    }, summary);
  }, [jobs]);

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

  useEffect(() => {
    const firstDentist = dentists.find(
      (dentist) => dentist.email || dentist.name,
    );
    if (!firstDentist) return;
    setJobDraft((prev) => {
      if (prev.dentist) return prev;
      return {
        ...prev,
        dentist: formatContactLabel(firstDentist.name, firstDentist.email),
      };
    });
  }, [dentists]);

  useEffect(() => {
    if (!exportFeedback) return;
    const timeout = setTimeout(() => setExportFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [exportFeedback]);

  if (loading || !user) {
    return (
      <PortalShell>
        <VerifySession />
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

  async function handleExportCases() {
    if (!jobs.length) {
      setExportFeedback({
        scope: "cases",
        message: {
          type: "error",
          text: "Aún no hay casos para exportar.",
        },
      });
      return;
    }

    setIsExportingCases(true);
    setExportFeedback(null);

    try {
      await exportCasesReport(jobs, statusSummary);
      setExportFeedback({
        scope: "cases",
        message: {
          type: "success",
          text: "Plantilla descargada. Revisa tu carpeta de descargas.",
        },
      });
    } catch (error) {
      console.error(error);
      setExportFeedback({
        scope: "cases",
        message: {
          type: "error",
          text: "No pudimos exportar los casos. Inténtalo nuevamente.",
        },
      });
    } finally {
      setIsExportingCases(false);
    }
  }

  async function handleExportTechnicians() {
    if (!technicians.length) {
      setExportFeedback({
        scope: "technicians",
        message: {
          type: "error",
          text: "Aún no hay laboratoristas registrados.",
        },
      });
      return;
    }

    setIsExportingTechnicians(true);
    setExportFeedback(null);

    try {
      await exportTechniciansDirectory(technicians);
      setExportFeedback({
        scope: "technicians",
        message: {
          type: "success",
          text: "Exportamos la lista de laboratoristas.",
        },
      });
    } catch (error) {
      console.error(error);
      setExportFeedback({
        scope: "technicians",
        message: {
          type: "error",
          text: "No pudimos exportar los laboratoristas.",
        },
      });
    } finally {
      setIsExportingTechnicians(false);
    }
  }

  async function handleExportDentists() {
    if (!dentists.length) {
      setExportFeedback({
        scope: "dentists",
        message: {
          type: "error",
          text: "Aún no hay doctores registrados.",
        },
      });
      return;
    }

    setIsExportingDentists(true);
    setExportFeedback(null);

    try {
      await exportDentistsDirectory(dentists);
      setExportFeedback({
        scope: "dentists",
        message: {
          type: "success",
          text: "Exportamos la lista de doctores.",
        },
      });
    } catch (error) {
      console.error(error);
      setExportFeedback({
        scope: "dentists",
        message: {
          type: "error",
          text: "No pudimos exportar los doctores.",
        },
      });
    } finally {
      setIsExportingDentists(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await createJob(jobDraft);
      setJobDraft((prev) => ({
        ...DEFAULT_JOB,
        arrivalDate: prev.arrivalDate,
        dueDate: "",
        assignedTo: prev.assignedTo,
        assignedToName: prev.assignedToName,
        dentist: prev.dentist,
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

    if (!isValidEmail(technicianDraft.email)) {
      setTechnicianMessage({
        type: "error",
        text: "Ingresa un correo electrónico válido.",
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

    const formattedPhone = buildPhoneNumber(
      technicianDraft.phoneCountry,
      technicianDraft.phoneNumber,
    );

    if (!formattedPhone) {
      setTechnicianMessage({
        type: "error",
        text: phoneErrorMessage(technicianDraft.phoneCountry),
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
          phone: formattedPhone,
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
      setTechnicianDraft(DEFAULT_TECHNICIAN);
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

  async function handleDentistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dentistDraft.email || !dentistDraft.password) {
      setDentistMessage({
        type: "error",
        text: "Correo y contraseña temporal son obligatorios.",
      });
      return;
    }

    if (!isValidEmail(dentistDraft.email)) {
      setDentistMessage({
        type: "error",
        text: "Ingresa un correo electrónico válido.",
      });
      return;
    }

    if (dentistDraft.password !== dentistDraft.confirmPassword) {
      setDentistMessage({
        type: "error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    const formattedPhone = buildPhoneNumber(
      dentistDraft.phoneCountry,
      dentistDraft.phoneNumber,
    );

    if (!formattedPhone) {
      setDentistMessage({
        type: "error",
        text: phoneErrorMessage(dentistDraft.phoneCountry),
      });
      return;
    }

    const adminToken = token?.token;

    if (!adminToken) {
      setDentistMessage({
        type: "error",
        text: "Sesión inválida. Vuelve a iniciar sesión como administrador.",
      });
      return;
    }

    setIsSavingDentist(true);
    setDentistMessage(null);

    try {
      const response = await fetch("/api/dentists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: dentistDraft.name,
          email: dentistDraft.email,
          phone: formattedPhone,
          password: dentistDraft.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "No se pudo registrar al doctor.");
      }

      const confirmedEmail = dentistDraft.email;
      setDentistDraft(DEFAULT_DENTIST);
      setDentistMessage({
        type: "success",
        text: `Doctor registrado. Comparte las credenciales con ${confirmedEmail}.`,
      });
    } catch (error) {
      setDentistMessage({ type: "error", text: (error as Error).message });
    } finally {
      setIsSavingDentist(false);
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

  async function handleDeleteDentist(dentistId: string) {
    const target = dentists.find((dentist) => dentist.id === dentistId);
    if (!target) return;

    const confirmed = window.confirm(
      `¿Eliminar al doctor ${target.name} (${target.email})? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    const adminToken = token?.token;

    if (!adminToken) {
      setDentistMessage({
        type: "error",
        text: "Sesión inválida. Vuelve a iniciar sesión como administrador.",
      });
      return;
    }

    setDeletingDentistId(dentistId);
    setDentistMessage(null);

    try {
      const response = await fetch("/api/dentists", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ uid: dentistId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "No se pudo eliminar al doctor.");
      }

      setDentistMessage({
        type: "success",
        text: `${target.name} fue eliminado del equipo médico.`,
      });
    } catch (error) {
      setDentistMessage({ type: "error", text: (error as Error).message });
    } finally {
      setDeletingDentistId(null);
    }
  }

  return (
    <PortalShell
      maxWidthClass="max-w-6xl"
      contentClassName="bg-white/85"
      paddingClass="px-4 py-8 sm:px-6 sm:py-12"
    >
      <header className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/intechlab-icon.png"
            alt="intechlab logo"
            width={400}
            height={400}
            className="h-10 w-auto"
            priority
          />
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted">
              Gestor interno
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-[var(--foreground)]">
                Panel administrativo
              </h1>
              <p className="w-full text-sm text-muted">
                Hola {adminName}, aquí puedes registrar casos, sumar personal
                médico y dar seguimiento a tu operación diaria.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="self-end rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold text-muted transition hover:border-black/40 hover:text-[var(--foreground)] md:self-auto"
        >
          Regresar
        </button>
      </header>
      <AdminTabsNav
        tabs={ADMIN_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "cases" ? (
        <section className="mt-8 grid gap-6 lg:[grid-template-columns:minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="min-w-0">
            <CaseForm
              jobDraft={jobDraft}
              technicians={technicians}
              dentists={dentists}
              onChange={setJobDraft}
              onSubmit={handleSubmit}
              isSaving={isSaving}
              message={message}
            />
          </div>
          <AdminSummaryPanel
            statusSummary={statusSummary}
            jobsLoading={jobsLoading}
            techniciansLoading={techniciansLoading}
            dentistsLoading={dentistsLoading}
            jobsCount={jobs.length}
            techniciansCount={technicians.length}
            dentistsCount={dentists.length}
            isExportingCases={isExportingCases}
            isExportingTechnicians={isExportingTechnicians}
            isExportingDentists={isExportingDentists}
            onExportCases={handleExportCases}
            onExportTechnicians={handleExportTechnicians}
            onExportDentists={handleExportDentists}
            exportFeedback={exportFeedback}
          />
        </section>
      ) : null}

      {activeTab === "technicians" ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <TechnicianForm
              draft={technicianDraft}
              onChange={setTechnicianDraft}
              onSubmit={handleTechnicianSubmit}
              isSaving={isSavingTechnician}
              message={technicianMessage}
            />
          </div>
          <div className="min-w-0">
            <TechniciansList
              technicians={technicians}
              loading={techniciansLoading}
              deletingId={deletingTechnicianId}
              onDelete={handleDeleteTechnician}
            />
          </div>
        </section>
      ) : null}

      {activeTab === "dentists" ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <DentistForm
              draft={dentistDraft}
              onChange={setDentistDraft}
              onSubmit={handleDentistSubmit}
              isSaving={isSavingDentist}
              message={dentistMessage}
            />
          </div>
          <div className="min-w-0">
            <DentistsList
              dentists={dentists}
              loading={dentistsLoading}
              deletingId={deletingDentistId}
              onDelete={handleDeleteDentist}
            />
          </div>
        </section>
      ) : null}
    </PortalShell>
  );
}
