"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useJobs } from "@/hooks/use-jobs";
import { useTechnicians } from "@/hooks/use-technicians";
import type { Job, JobStatus } from "@/types/job";
import { updateJobStatus } from "@/lib/jobs/actions";
import { storage } from "@/lib/firebase/client";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ArrowRight, Loader2, LogOut, UploadCloud } from "lucide-react";

type EvidencePayload = {
  note: string;
  file: File | null;
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
  const { jobs, groupedByStatus, loading: jobsLoading } = useJobs(jobFilters);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  async function handleAdvance(job: Job, nextStatus: JobStatus) {
    if (job.status === "en-proceso" && nextStatus === "listo") {
      setStatusError("Debes adjuntar evidencia antes de marcar como listo.");
      return;
    }

    if (nextStatus === "entregado" && !isAdmin) {
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
    if (!payload.note.trim()) {
      setStatusError("Añade una nota que describa la evidencia.");
      return;
    }

    if (!payload.file) {
      setStatusError("Selecciona una imagen antes de enviar.");
      return;
    }

    setUpdatingJobId(job.id);
    setStatusError(null);

    try {
      const imageUrl = await uploadEvidenceAsset(job.id, payload.file);
      await updateJobStatus(job.id, "listo", {
        completionEvidence: {
          note: payload.note.trim(),
          imageUrl,
          submittedBy: userIdentity ?? job.assignedTo ?? "sin-identidad",
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
          return (
            <article
              key={status}
              className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_20px_50px_rgba(26,18,11,0.07)]"
            >
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">
                    {status}
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    {statusJobs.length} casos
                  </h2>
                </div>
                <span className="text-sm text-muted">Ordenado por entrega</span>
              </header>
              <div className="mt-4 space-y-4">
                {(jobsLoading ? skeletonJobs : statusJobs).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    canAdvance={
                      Boolean(userIdentity) &&
                      job.assignedTo === userIdentity &&
                      !jobsLoading
                    }
                    isAdmin={isAdmin}
                    onAdvance={handleAdvance}
                    onSubmitEvidence={handleSubmitEvidence}
                    isUpdating={updatingJobId === job.id}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-10 flex items-center justify-between rounded-3xl border border-black/10 bg-[var(--card)] px-6 py-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Necesitas algo
          </p>
          <p className="text-base text-[var(--foreground)]">
            Reporta bloqueos directamente al administrador para reasignar.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Ir a administración
          <ArrowRight className="size-4" />
        </button>
      </section>
    </PortalShell>
  );
}

function JobCard({
  job,
  canAdvance,
  isAdmin,
  onAdvance,
  onSubmitEvidence,
  isUpdating,
}: {
  job: Job;
  canAdvance: boolean;
  isAdmin: boolean;
  onAdvance: (job: Job, nextStatus: JobStatus) => void | Promise<void>;
  onSubmitEvidence: (job: Job, payload: EvidencePayload) => Promise<void>;
  isUpdating: boolean;
}) {
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const badge = statusConfig[job.status];
  const nextStatus = getNextStatus(job.status);
  const nextLabel = nextStatus ? statusConfig[nextStatus].label : null;
  const assignedLabel = job.assignedToName ?? job.assignedTo ?? "Sin asignar";
  const requiresEvidence = job.status === "en-proceso";
  const awaitingDelivery = nextStatus === "entregado";
  const canAdminDeliver = awaitingDelivery && isAdmin;
  const showAdvanceButton =
    Boolean(nextStatus) &&
    !requiresEvidence &&
    ((job.status === "pendiente" && canAdvance) ||
      (job.status === "listo" && canAdminDeliver));

  async function submitEvidence() {
    setEvidenceError(null);

    if (!evidenceNote.trim()) {
      setEvidenceError("Describe la evidencia en la nota.");
      return;
    }

    if (!evidenceFile) {
      setEvidenceError("Selecciona una imagen antes de subir.");
      return;
    }

    try {
      await onSubmitEvidence(job, {
        note: evidenceNote.trim(),
        file: evidenceFile,
      });
      setEvidenceNote("");
      setEvidenceFile(null);
    } catch (error) {
      setEvidenceError((error as Error).message);
    }
  }

  const blockedMessage = (() => {
    if (job.status === "entregado") return "Caso finalizado";
    if (requiresEvidence && !canAdvance)
      return "Solo el asignado puede subir evidencia.";
    if (awaitingDelivery && !isAdmin)
      return "Solo un administrador puede entregar.";
    return "Sin permisos para avanzar";
  })();

  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-[var(--foreground)]">
          {job.patientName}
        </p>
        <span
          className={`${badge.bg} ${badge.text} rounded-full px-3 py-1 text-xs font-semibold`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-sm text-muted">{job.treatment}</p>
      <p className="mt-1 text-sm text-muted">
        Doctor: {job.dentist || "Sin asignar"}
      </p>
      <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
        <span>F. llegada: {formatDateTime(job.arrivalDate)}</span>
        <span>Entrega: {formatDateTime(job.dueDate)}</span>
      </div>
      {job.notes && (
        <p className="mt-2 text-sm text-muted">Nota: {job.notes}</p>
      )}
      {job.completionEvidence ? (
        <div className="mt-3 rounded-2xl border border-black/10 bg-[#f6f8fb] p-3 text-xs text-[var(--foreground)]">
          <p className="font-semibold">Evidencia cargada</p>
          <p className="mt-1 text-muted">{job.completionEvidence.note}</p>
          <a
            href={job.completionEvidence.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-black/40"
          >
            <ArrowRight className="size-3" /> Ver imagen
          </a>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted">
            Registrado el {formatDateTime(job.completionEvidence.submittedAt)}{" "}
            por {job.completionEvidence.submittedBy || "equipo"}
          </p>
        </div>
      ) : null}
      <div className="mt-3 flex flex-col gap-3 text-xs text-muted">
        <span>Asignado a: {assignedLabel}</span>
        {requiresEvidence && canAdvance ? (
          <div className="rounded-2xl border border-dashed border-black/20 bg-[#f9fbff] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
              Adjunta evidencia
            </p>
            <textarea
              value={evidenceNote}
              onChange={(event) => setEvidenceNote(event.target.value)}
              placeholder="Describe lo que se completó..."
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-xs text-[var(--foreground)] focus:border-black/40 focus:outline-none"
              rows={3}
            />
            <label className="mt-2 flex cursor-pointer flex-col gap-1 text-[var(--foreground)]">
              <span className="text-xs font-semibold">Imagen de evidencia</span>
              <input
                type="file"
                accept="image/*"
                className="text-xs"
                onChange={(event) =>
                  setEvidenceFile(event.target.files?.[0] ?? null)
                }
              />
            </label>
            {evidenceError ? (
              <p className="mt-2 text-[11px] text-[#c0392b]">{evidenceError}</p>
            ) : null}
            <button
              type="button"
              onClick={submitEvidence}
              disabled={isUpdating}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isUpdating ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <UploadCloud className="size-3" />
              )}
              {isUpdating ? "Cargando evidencia" : "Subir y marcar listo"}
            </button>
          </div>
        ) : showAdvanceButton && nextStatus ? (
          <button
            type="button"
            onClick={() => onAdvance(job, nextStatus)}
            disabled={isUpdating}
            className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-black/40 disabled:opacity-60"
          >
            {isUpdating ? <Loader2 className="size-3 animate-spin" /> : null}
            {isUpdating ? "Actualizando" : `Pasar a ${nextLabel}`}
          </button>
        ) : (
          <span className="text-[var(--foreground)]/70">{blockedMessage}</span>
        )}
      </div>
    </div>
  );
}

const statusConfig = {
  pendiente: { label: "Pendiente", bg: "bg-[#fff4de]", text: "text-[#b77516]" },
  "en-proceso": {
    label: "En proceso",
    bg: "bg-[#e4f0ff]",
    text: "text-[#1f4db8]",
  },
  listo: { label: "Listo", bg: "bg-[#dff3e3]", text: "text-[#1f8f58]" },
  entregado: { label: "Entregado", bg: "bg-[#e9e9e9]", text: "text-[#5d5d5d]" },
} as const;

const statusOrder: JobStatus[] = [
  "pendiente",
  "en-proceso",
  "listo",
  "entregado",
];

function getNextStatus(status: JobStatus): JobStatus | null {
  const index = statusOrder.indexOf(status);
  if (index === -1 || index === statusOrder.length - 1) return null;
  return statusOrder[index + 1];
}

const skeletonJobs: Job[] = Array.from({ length: 3 }).map((_, index) => ({
  id: `placeholder-${index}`,
  patientName: "Sincronizando...",
  treatment: "",
  dentist: "",
  arrivalDate: new Date().toISOString(),
  dueDate: new Date().toISOString(),
  assignedTo: "",
  assignedToName: "",
  status: "pendiente",
  priority: "media",
}));

function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-4xl border border-black/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(26,18,11,0.1)]">
        {children}
      </div>
    </main>
  );
}

function formatDateTime(date: string) {
  if (!date) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

async function uploadEvidenceAsset(jobId: string, file: File) {
  if (!storage) {
    throw new Error("Configura Firebase Storage para subir evidencia.");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const evidenceRef = ref(
    storage,
    `jobs/${jobId}/evidence-${Date.now()}.${extension}`,
  );

  await uploadBytes(evidenceRef, file, {
    contentType: file.type || "application/octet-stream",
  });

  return getDownloadURL(evidenceRef);
}
