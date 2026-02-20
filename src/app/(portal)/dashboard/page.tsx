"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { JobCard, PortalShell } from "@/components/dashboard";
import { JOB_STATUS, skeletonJobs, statusOrder } from "@/constants";
import { useJobs } from "@/hooks/use-jobs";
import { useTechnicians } from "@/hooks/use-technicians";
import { updateJobAssignment, updateJobStatus } from "@/lib/jobs/actions";
import { useAuth } from "@/providers/auth-provider";
import type { Job, JobStatus } from "@/types/job";
import type { DeliveryPayload, EvidencePayload } from "@/types/evidence";
import { uploadDeliveryAsset, uploadEvidenceAsset } from "@/utils";
import Image from "next/image";

type SortMode = "dueDate" | "priority";

const sortModeLabels: Record<SortMode, string> = {
  dueDate: "entrega",
  priority: "prioridad",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOutUser, isAdmin } = useAuth();
  const userIdentity = user?.email ?? user?.displayName ?? undefined;
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const [selectedTechnician, setSelectedTechnician] = useState<string>("all");
  const jobFilters = (() => {
    if (isAdmin) {
      if (!selectedTechnician || selectedTechnician === "all") {
        return undefined;
      }
      return { assignedTo: selectedTechnician };
    }

    return userIdentity ? { assignedTo: userIdentity } : undefined;
  })();
  const { groupedByStatus, loading: jobsLoading } = useJobs(jobFilters);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [expandedStatuses, setExpandedStatuses] = useState<
    Record<JobStatus, boolean>
  >(() =>
    statusOrder.reduce(
      (acc, status) => {
        acc[status] = false;
        return acc;
      },
      {} as Record<JobStatus, boolean>,
    ),
  );
  const [statusSort, setStatusSort] = useState<Record<JobStatus, SortMode>>(
    () =>
      statusOrder.reduce(
        (acc, status) => {
          acc[status] = "dueDate";
          return acc;
        },
        {} as Record<JobStatus, SortMode>,
      ),
  );
  const [openSortMenu, setOpenSortMenu] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  async function handleAdvance(job: Job, nextStatus: JobStatus) {
    if (
      job.status === JOB_STATUS.IN_PROGRESS &&
      nextStatus === JOB_STATUS.READY
    ) {
      setStatusError("Debes adjuntar evidencia antes de marcar como listo.");
      return;
    }

    if (nextStatus === JOB_STATUS.DELIVERED && !isAdmin) {
      setStatusError(
        "Solo un administrador puede marcar el caso como entregado.",
      );
      return;
    }

    setUpdatingJobId(job.id);
    setStatusError(null);

    try {
      await updateJobStatus(job.id, nextStatus);
    } catch (error) {
      setStatusError((error as Error).message);
    } finally {
      setUpdatingJobId(null);
    }
  }

  async function handleSubmitEvidence(job: Job, payload: EvidencePayload) {
    const trimmedNote = payload.note.trim();

    if (!trimmedNote) {
      setStatusError("Añade una nota que describa la evidencia.");
      return;
    }

    if (!payload.files.length) {
      setStatusError("Adjunta al menos una imagen antes de enviar.");
      return;
    }

    setUpdatingJobId(job.id);
    setStatusError(null);

    try {
      const submittedBy = userIdentity ?? job.assignedTo ?? "sin-identidad";
      const attachments = await Promise.all(
        payload.files.map((file) =>
          uploadEvidenceAsset(job.id, file, submittedBy),
        ),
      );

      await updateJobStatus(job.id, JOB_STATUS.READY, {
        completionEvidence: {
          note: trimmedNote,
          attachments,
          submittedBy,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      const message =
        (error as Error).message ?? "No se pudo cargar la evidencia.";
      setStatusError(message);
      throw error;
    } finally {
      setUpdatingJobId(null);
    }
  }

  async function handleSubmitDeliveryEvidence(
    job: Job,
    payload: DeliveryPayload,
  ) {
    if (!isAdmin) {
      setStatusError("Solo un administrador puede entregar el caso.");
      return;
    }

    if (!payload.files.length) {
      setStatusError("Adjunta al menos un archivo de entrega.");
      return;
    }

    setUpdatingJobId(job.id);
    setStatusError(null);

    try {
      const attachments = await Promise.all(
        payload.files.map((file) =>
          uploadDeliveryAsset(job.id, file, userIdentity ?? "admin@intechlab"),
        ),
      );

      const note = payload.note?.trim();
      const deliveryEvidence: Record<string, unknown> = {
        attachments,
        submittedBy: userIdentity ?? "admin@intechlab",
        submittedAt: new Date().toISOString(),
      };

      if (note) {
        deliveryEvidence.note = note;
      }

      await updateJobStatus(job.id, JOB_STATUS.DELIVERED, {
        deliveryEvidence,
      });
    } catch (error) {
      const message =
        (error as Error).message ?? "No se pudo registrar la evidencia final.";
      setStatusError(message);
    } finally {
      setUpdatingJobId(null);
    }
  }

  async function handleReturnToProcess(job: Job) {
    if (!isAdmin) {
      setStatusError("Solo un administrador puede modificar este caso.");
      return;
    }

    setUpdatingJobId(job.id);
    setStatusError(null);

    try {
      await updateJobStatus(job.id, JOB_STATUS.IN_PROGRESS);
    } catch (error) {
      setStatusError(
        (error as Error).message ?? "No se pudo devolver el caso a proceso.",
      );
    } finally {
      setUpdatingJobId(null);
    }
  }

  async function handleReassignTechnician(job: Job, technicianEmail: string) {
    if (!isAdmin) {
      setStatusError("Solo un administrador puede reasignar casos.");
      return;
    }

    if (!technicianEmail) {
      setStatusError("Selecciona un laboratorista válido.");
      return;
    }

    const target = technicians.find((tech) => tech.email === technicianEmail);

    setUpdatingJobId(job.id);
    setStatusError(null);

    try {
      await updateJobAssignment(
        job.id,
        technicianEmail,
        target?.name ?? technicianEmail,
      );
    } catch (error) {
      setStatusError(
        (error as Error).message ?? "No se pudo reasignar el caso.",
      );
    } finally {
      setUpdatingJobId(null);
    }
  }

  function toggleStatusVisibility(status: JobStatus) {
    setExpandedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  }

  function toggleSortMenu(status: JobStatus) {
    setOpenSortMenu((prev) => (prev === status ? null : status));
  }

  function handleSortChange(status: JobStatus, mode: SortMode) {
    setStatusSort((prev) => ({
      ...prev,
      [status]: mode,
    }));
    setOpenSortMenu(null);
  }

  if (loading || !user) {
    return (
      <PortalShell>
        <p className="text-muted">Verificando sesión...</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <header className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-x-4">
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
              Carga personal
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              Hola {user.displayName ?? user.email},{" "}
              {isAdmin ? "estos son todos los casos." : "estos son tus casos."}
            </h1>
            <p className="text-sm text-muted">
              Última actualización:{" "}
              {new Intl.DateTimeFormat("es-ES", {
                dateStyle: "full",
                timeStyle: "short",
              }).format(new Date())}
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex w-full flex-col gap-2 rounded-3xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-muted md:w-auto">
            <span className="text-[10px] uppercase tracking-[0.4em]">
              Filtrar por laboratorista
            </span>
            <select
              value={selectedTechnician}
              onChange={(event) => setSelectedTechnician(event.target.value)}
              className="rounded-2xl border border-black/10 px-4 py-2 text-[var(--foreground)] focus:border-black/40 focus:outline-none"
            >
              <option value="all">Todos los casos</option>
              {technicians
                .filter((tech) => Boolean(tech.email))
                .map((tech) => (
                  <option key={tech.id} value={tech.email ?? ""}>
                    {tech.name} — {tech.email}
                  </option>
                ))}
            </select>
            {techniciansLoading && (
              <span className="text-[11px] text-muted">
                Sincronizando lista...
              </span>
            )}
          </div>
        )}
        <button
          onClick={signOutUser}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-black/30"
        >
          <LogOut className="size-4" />
          Salir
        </button>
      </header>

      {statusError && (
        <p className="mt-4 rounded-2xl bg-[#ffe6e0] px-4 py-3 text-sm text-[#c0392b]">
          {statusError}
        </p>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {statusOrder.map((status) => {
          const statusJobs = groupedByStatus[status];
          const isExpanded = expandedStatuses[status] ?? false;
          const sortMode = statusSort[status] ?? "dueDate";
          const displayJobs = jobsLoading
            ? skeletonJobs
            : sortJobsByMode(statusJobs, sortMode);
          const canToggle = jobsLoading || statusJobs.length > 0;
          const sortMenuOpen = openSortMenu === status;
          return (
            <article
              key={status}
              className="min-w-0 rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_20px_50px_rgba(26,18,11,0.07)]"
            >
              <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">
                    {status}
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    {statusJobs.length} casos
                  </h2>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
                  <div className="relative flex-1 lg:flex-initial">
                    <button
                      type="button"
                      onClick={() => toggleSortMenu(status)}
                      aria-haspopup="menu"
                      aria-expanded={sortMenuOpen}
                      className="inline-flex w-full items-center justify-between gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-muted transition hover:border-black/30 lg:w-48"
                    >
                      Ordenar por {sortModeLabels[sortMode]}
                      <ChevronDown className="size-4" />
                    </button>
                    {sortMenuOpen ? (
                      <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-black/10 bg-white py-2 shadow-xl">
                        {(Object.keys(sortModeLabels) as SortMode[]).map(
                          (mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => handleSortChange(status, mode)}
                              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                                sortMode === mode
                                  ? "font-semibold text-[var(--foreground)]"
                                  : "text-muted"
                              } hover:bg-black/5`}
                            >
                              Ordenar por {sortModeLabels[mode]}
                              {sortMode === mode ? "·" : null}
                            </button>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => canToggle && toggleStatusVisibility(status)}
                    aria-expanded={isExpanded}
                    disabled={!canToggle}
                    className={`inline-flex size-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 text-muted transition ${
                      canToggle ? "hover:border-black/30" : "opacity-40"
                    }`}
                  >
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </header>
              {isExpanded && canToggle ? (
                <div className="mt-4 space-y-4">
                  {displayJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      canAdvance={
                        Boolean(userIdentity) &&
                        job.assignedTo === userIdentity &&
                        !jobsLoading
                      }
                      isAdmin={isAdmin}
                      technicians={technicians}
                      onAdvance={handleAdvance}
                      onSubmitEvidence={handleSubmitEvidence}
                      onSubmitDeliveryEvidence={handleSubmitDeliveryEvidence}
                      onReturnToProcess={handleReturnToProcess}
                      onReassignTechnician={handleReassignTechnician}
                      isUpdating={updatingJobId === job.id}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {isAdmin && (
        <section className="mt-10 flex items-center justify-between rounded-3xl border border-black/10 bg-[var(--card)] px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted">
              Panel de administración
            </p>
            <p className="text-base text-[var(--foreground)]">
              Crea nuevos casos y gestiona usuarios desde aquí.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Ir
            <ArrowRight className="size-4" />
          </button>
        </section>
      )}
    </PortalShell>
  );
}

const priorityOrder: Record<Job["priority"], number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

function sortJobsByMode(jobs: Job[], mode: SortMode) {
  const list = [...jobs];
  if (mode === "priority") {
    return list.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }

  return list.sort((a, b) => getTimeValue(a.dueDate) - getTimeValue(b.dueDate));
}

function getTimeValue(value: string) {
  const time = Date.parse(value);
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}
