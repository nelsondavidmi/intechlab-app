"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Loader2, UploadCloud } from "lucide-react";

import type { Job, JobStatus } from "@/types/job";
import type { Technician } from "@/types/technician";
import type { DeliveryPayload, EvidencePayload } from "@/types/evidence";
import { JOB_STATUS, statusConfig } from "@/constants";
import {
  formatDateTime,
  formatFileSize,
  getNextStatus,
  mergeFilesBySignature,
} from "@/utils";

export type JobCardProps = {
  job: Job;
  canAdvance: boolean;
  isAdmin: boolean;
  hidePriority?: boolean;
  technicians: Technician[];
  onAdvance: (job: Job, nextStatus: JobStatus) => void | Promise<void>;
  onSubmitEvidence: (job: Job, payload: EvidencePayload) => Promise<void>;
  onSubmitDeliveryEvidence: (
    job: Job,
    payload: DeliveryPayload,
  ) => Promise<void>;
  onReturnToProcess: (job: Job) => Promise<void> | void;
  onReassignTechnician: (
    job: Job,
    technicianEmail: string,
  ) => Promise<void> | void;
  isUpdating: boolean;
};

const REASSIGNABLE_STATUSES = new Set<JobStatus>([JOB_STATUS.PENDING]);
const PRIORITY_STYLES: Record<
  Job["priority"],
  { label: string; bg: string; text: string }
> = {
  alta: {
    label: "Alta",
    bg: "bg-[#ffe6e6]",
    text: "text-[#c0392b]",
  },
  media: {
    label: "Media",
    bg: "bg-[#fff4de]",
    text: "text-[#b77516]",
  },
  baja: {
    label: "Baja",
    bg: "bg-[#e3f4e7]",
    text: "text-[#1f8f58]",
  },
};
export function JobCard({
  job,
  canAdvance,
  isAdmin,
  hidePriority,
  technicians,
  onAdvance,
  onSubmitEvidence,
  onSubmitDeliveryEvidence,
  onReturnToProcess,
  onReassignTechnician,
  isUpdating,
}: JobCardProps) {
  const [evidenceNote, setEvidenceNote] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const evidenceInputRef = useRef<HTMLInputElement | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const deliveryInputRef = useRef<HTMLInputElement | null>(null);
  const [reassignSelection, setReassignSelection] = useState(
    job.assignedTo ?? "",
  );
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    setReassignSelection(job.assignedTo ?? "");
  }, [job.assignedTo]);

  const badge = statusConfig[job.status];
  const priorityBadge = hidePriority ? null : PRIORITY_STYLES[job.priority];
  const nextStatus = getNextStatus(job.status);
  const nextLabel = nextStatus ? statusConfig[nextStatus].label : null;
  const assignedLabel = job.assignedToName ?? job.assignedTo ?? "Sin asignar";
  const requiresEvidence = job.status === JOB_STATUS.IN_PROGRESS;
  const awaitingDelivery = nextStatus === JOB_STATUS.DELIVERED;
  const requiresDeliveryEvidence = job.status === JOB_STATUS.READY && isAdmin;
  const canAdminDeliver = awaitingDelivery && isAdmin;
  const canReassign = isAdmin && REASSIGNABLE_STATUSES.has(job.status);
  const availableTechnicians = technicians.filter((tech) => tech.email);
  const showAdvanceButton =
    Boolean(nextStatus) &&
    !requiresEvidence &&
    !requiresDeliveryEvidence &&
    job.status === JOB_STATUS.PENDING &&
    canAdvance;

  async function submitEvidence() {
    setEvidenceError(null);
    const trimmedNote = evidenceNote.trim();

    if (!trimmedNote) {
      setEvidenceError("Describe la evidencia en la nota.");
      return;
    }

    if (!evidenceFiles.length) {
      setEvidenceError("Selecciona una o más imágenes antes de subir.");
      return;
    }

    try {
      await onSubmitEvidence(job, {
        note: trimmedNote,
        files: evidenceFiles,
      });
      setEvidenceNote("");
      setEvidenceFiles([]);
    } catch (error) {
      setEvidenceError((error as Error).message);
    }
  }

  async function submitDelivery() {
    setDeliveryError(null);

    if (!deliveryFiles.length) {
      setDeliveryError("Adjunta al menos un archivo.");
      return;
    }

    try {
      await onSubmitDeliveryEvidence(job, {
        note: deliveryNote.trim(),
        files: deliveryFiles,
      });
      setDeliveryNote("");
      setDeliveryFiles([]);
    } catch (error) {
      setDeliveryError((error as Error).message);
    }
  }

  const blockedMessage = (() => {
    if (job.status === JOB_STATUS.DELIVERED) return "Caso finalizado";
    if (requiresEvidence && !canAdvance)
      return "Solo el asignado puede subir evidencia.";
    if (job.status === JOB_STATUS.READY && !isAdmin)
      return "Solo un administrador puede entregar.";
    if (requiresDeliveryEvidence)
      return "Adjunta la evidencia final para entregar.";
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
      {priorityBadge ? (
        <span
          className={`mt-2 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${priorityBadge.bg} ${priorityBadge.text}`}
        >
          Prioridad: {priorityBadge.label}
        </span>
      ) : null}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] transition hover:text-black"
        >
          {isCollapsed ? "Ver detalles" : "Ocultar detalles"}
          <ChevronDown
            className={`size-4 transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>
      {!isCollapsed ? (
        <>
          {job.completionEvidence ? (
            <div className="mt-3 rounded-2xl border border-black/10 bg-[#f6f8fb] p-3 text-xs text-[var(--foreground)]">
              <p className="font-semibold">Evidencia cargada</p>
              <p className="mt-1 text-muted">{job.completionEvidence.note}</p>
              {job.completionEvidence.attachments?.length ? (
                <ul className="mt-2 space-y-1">
                  {job.completionEvidence.attachments.map((attachment) => (
                    <li
                      key={attachment.downloadUrl}
                      className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1"
                    >
                      <ArrowRight className="size-3 text-muted" />
                      <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs font-semibold text-[var(--foreground)] underline-offset-2 hover:underline"
                      >
                        {attachment.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted">Sin archivos adjuntos.</p>
              )}
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                Registrado el{" "}
                {formatDateTime(job.completionEvidence.submittedAt)} por{" "}
                {job.completionEvidence.submittedBy || "equipo"}
              </p>
            </div>
          ) : null}
          {job.deliveryEvidence ? (
            <div className="mt-3 rounded-2xl border border-black/10 bg-[#f2f7f2] p-3 text-xs text-[var(--foreground)]">
              <p className="font-semibold">Entrega registrada</p>
              {job.deliveryEvidence.note && (
                <p className="mt-1 text-muted">{job.deliveryEvidence.note}</p>
              )}
              {job.deliveryEvidence.attachments?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {job.deliveryEvidence.attachments.map((attachment) => (
                    <li key={attachment.downloadUrl}>
                      <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[var(--foreground)] underline-offset-2 hover:underline"
                      >
                        {attachment.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted">Sin archivos adjuntos.</p>
              )}
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted">
                Registrado el {formatDateTime(job.deliveryEvidence.submittedAt)}{" "}
                por {job.deliveryEvidence.submittedBy || "equipo"}
              </p>
            </div>
          ) : null}
          <div className="mt-3 flex flex-col gap-3 text-xs text-muted">
            <span>Asignado a: {assignedLabel}</span>
            {canReassign ? (
              <div className="rounded-2xl border border-dashed border-black/20 bg-[#fcfbf6] p-3 text-[var(--foreground)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
                  Cambiar laboratorista
                </p>
                {availableTechnicians.length ? (
                  <>
                    <select
                      value={reassignSelection}
                      onChange={(event) =>
                        setReassignSelection(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-xs text-[var(--foreground)] focus:border-black/40 focus:outline-none"
                    >
                      <option value="">Selecciona un laboratorista</option>
                      {availableTechnicians.map((tech) => (
                        <option key={tech.id} value={tech.email ?? ""}>
                          {tech.name} — {tech.email}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        reassignSelection &&
                        onReassignTechnician(job, reassignSelection)
                      }
                      disabled={
                        isUpdating ||
                        !reassignSelection ||
                        reassignSelection === job.assignedTo
                      }
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-black/15 px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-black/40 disabled:opacity-60"
                    >
                      {isUpdating ? (
                        <Loader2 className="mr-2 size-3 animate-spin" />
                      ) : null}
                      {isUpdating ? "Actualizando" : "Reasignar caso"}
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-muted">
                    No hay laboratoristas disponibles.
                  </p>
                )}
              </div>
            ) : null}
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
                <div className="mt-2 flex flex-col gap-2 text-[var(--foreground)]">
                  <span className="text-xs font-semibold">
                    Imágenes de evidencia
                  </span>
                  <input
                    ref={evidenceInputRef}
                    id={`evidence-input-${job.id}`}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      setEvidenceFiles((prev) =>
                        mergeFilesBySignature(prev, files),
                      );
                      setEvidenceError(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => evidenceInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-full border border-black/15 px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Seleccionar imágenes
                  </button>
                </div>
                {evidenceFiles.length ? (
                  <ul className="mt-2 space-y-1 text-[var(--foreground)]">
                    {evidenceFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-1"
                      >
                        <div className="flex flex-col">
                          <span className="truncate text-xs font-medium">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-muted">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEvidenceFiles((prev) =>
                              prev.filter(
                                (_, fileIndex) => fileIndex !== index,
                              ),
                            )
                          }
                          className="text-[10px] font-semibold text-[#b77516] underline-offset-2 hover:underline"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-muted">
                    Puedes adjuntar varias imágenes del trabajo finalizado.
                  </p>
                )}
                {evidenceError ? (
                  <p className="mt-2 text-[11px] text-[#c0392b]">
                    {evidenceError}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={submitEvidence}
                    disabled={isUpdating}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isUpdating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <UploadCloud className="size-3" />
                    )}
                    {isUpdating
                      ? "Cargando evidencia"
                      : "Subir archivos y marcar listo"}
                  </button>
                  {evidenceFiles.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceFiles([]);
                        setEvidenceError(null);
                      }}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-black/15 px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:border-black/40"
                    >
                      Limpiar archivos
                    </button>
                  ) : null}
                </div>
              </div>
            ) : requiresDeliveryEvidence && canAdminDeliver ? (
              <div className="rounded-2xl border border-dashed border-black/20 bg-[#f5f7ee] p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
                  Adjunta archivos de entrega
                </p>
                <textarea
                  value={deliveryNote}
                  onChange={(event) => setDeliveryNote(event.target.value)}
                  placeholder="Notas opcionales (ej. factura, guía, comentarios)"
                  className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-xs text-[var(--foreground)] focus:border-black/40 focus:outline-none"
                  rows={3}
                />
                <div className="mt-2 flex flex-col gap-2 text-[var(--foreground)]">
                  <span className="text-xs font-semibold">
                    Archivos adjuntos
                  </span>
                  <input
                    ref={deliveryInputRef}
                    id={`delivery-input-${job.id}`}
                    type="file"
                    multiple
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      setDeliveryFiles((prev) =>
                        mergeFilesBySignature(prev, files),
                      );
                      setDeliveryError(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => deliveryInputRef.current?.click()}
                    className="inline-flex items-center justify-center rounded-full border border-black/15 px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Seleccionar archivos
                  </button>
                </div>
                {deliveryFiles.length ? (
                  <ul className="mt-2 space-y-1 text-[var(--foreground)]">
                    {deliveryFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-1"
                      >
                        <div className="flex flex-col">
                          <span className="truncate text-xs font-medium">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-muted">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDeliveryFiles((prev) =>
                              prev.filter(
                                (_, fileIndex) => fileIndex !== index,
                              ),
                            )
                          }
                          className="text-[10px] font-semibold text-[#b77516] underline-offset-2 hover:underline"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-muted">
                    Puedes subir imágenes, PDFs u otros archivos necesarios.
                  </p>
                )}
                {deliveryError ? (
                  <p className="mt-2 text-[11px] text-[#c0392b]">
                    {deliveryError}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => onReturnToProcess(job)}
                    disabled={isUpdating}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-[#b77516] px-3 py-2 text-xs font-semibold text-[#b77516] hover:bg-[#fff4de] disabled:opacity-60"
                  >
                    {isUpdating ? "Actualizando" : "Devolver a en proceso"}
                  </button>
                  <button
                    type="button"
                    onClick={submitDelivery}
                    disabled={isUpdating}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isUpdating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <UploadCloud className="size-3" />
                    )}
                    {isUpdating ? "Registrando" : "Adjuntar y entregar"}
                  </button>
                </div>
              </div>
            ) : showAdvanceButton && nextStatus ? (
              <button
                type="button"
                onClick={() => onAdvance(job, nextStatus)}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-black/40 disabled:opacity-60"
              >
                {isUpdating ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : null}
                {isUpdating ? "Actualizando" : `Pasar a ${nextLabel}`}
              </button>
            ) : (
              <span className="text-[var(--foreground)]/70">
                {blockedMessage}
              </span>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
