"use client";

import { Download } from "lucide-react";
import type {
  ExportScope,
  StatusSummary,
} from "@/app/(portal)/admin/admin.types";
import type { FormMessage } from "@/components/admin/form-feedback";
import { StatusPill } from "@/components/admin/status-pill";

type ExportFeedbackPayload = {
  scope: ExportScope;
  message: Exclude<FormMessage, null>;
} | null;

export type AdminSummaryPanelProps = {
  statusSummary: StatusSummary;
  jobsLoading: boolean;
  techniciansLoading: boolean;
  dentistsLoading: boolean;
  jobsCount: number;
  techniciansCount: number;
  dentistsCount: number;
  isExportingCases: boolean;
  isExportingTechnicians: boolean;
  isExportingDentists: boolean;
  onExportCases: () => void;
  onExportTechnicians: () => void;
  onExportDentists: () => void;
  exportFeedback: ExportFeedbackPayload;
};

type ExportCardConfig = {
  id: ExportScope;
  title: string;
  description: string;
  buttonLabel: string;
  loadingLabel: string;
  isDataLoading: boolean;
  isEmpty: boolean;
  isLoading: boolean;
  onClick: () => void;
  emptyLabel: string;
};

export function AdminSummaryPanel({
  statusSummary,
  jobsLoading,
  techniciansLoading,
  dentistsLoading,
  jobsCount,
  techniciansCount,
  dentistsCount,
  isExportingCases,
  isExportingTechnicians,
  isExportingDentists,
  onExportCases,
  onExportTechnicians,
  onExportDentists,
  exportFeedback,
}: AdminSummaryPanelProps) {
  const statusPills = [
    {
      label: "Pendientes",
      value: statusSummary.pending,
      accent: "bg-[#fff5e6] text-[#c07a00]",
    },
    {
      label: "En proceso",
      value: statusSummary.inProgress,
      accent: "bg-[#eef5ff] text-[#1d5fd1]",
    },
    {
      label: "Listos",
      value: statusSummary.ready,
      accent: "bg-[#effaf3] text-[#1d8b4d]",
    },
    {
      label: "Entregados",
      value: statusSummary.delivered,
      accent: "bg-[#f6f1ff] text-[#6c3db8]",
    },
  ];

  const cards: ExportCardConfig[] = [
    {
      id: "cases",
      title: "Exportar casos",
      description:
        "Descarga un Excel con este resumen y todos los casos con los estilos de Intechlab.",
      buttonLabel: "Exportar casos",
      loadingLabel: "Generando plantilla…",
      isDataLoading: jobsLoading,
      isEmpty: jobsCount === 0,
      isLoading: isExportingCases,
      onClick: onExportCases,
      emptyLabel: "Aún no hay casos registrados",
    },
    {
      id: "technicians",
      title: "Exportar laboratoristas",
      description:
        "Obtén el directorio completo del equipo de laboratorio con sus correos, teléfonos y roles.",
      buttonLabel: "Exportar laboratoristas",
      loadingLabel: "Generando directorio…",
      isDataLoading: techniciansLoading,
      isEmpty: techniciansCount === 0,
      isLoading: isExportingTechnicians,
      onClick: onExportTechnicians,
      emptyLabel: "Aún no hay laboratoristas registrados",
    },
    {
      id: "dentists",
      title: "Exportar doctores",
      description:
        "Descarga la lista de doctores con la misma plantilla estilizada para compartirla con tu equipo.",
      buttonLabel: "Exportar doctores",
      loadingLabel: "Preparando archivo…",
      isDataLoading: dentistsLoading,
      isEmpty: dentistsCount === 0,
      isLoading: isExportingDentists,
      onClick: onExportDentists,
      emptyLabel: "Aún no hay doctores registrados",
    },
  ];

  return (
    <article className="min-w-0 rounded-3xl border border-black/10 bg-gradient-to-br from-white via-white to-[#f7f8fb] p-6 shadow-[0_25px_60px_rgba(26,18,11,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Estado global
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {jobsLoading
              ? "Sincronizando..."
              : `${statusSummary.total} casos registrados`}
          </h3>
        </div>
        <span className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
          {jobsLoading ? "···" : `${statusSummary.total}`}
        </span>
      </div>
      {!jobsLoading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {statusPills.map((pill) => (
            <StatusPill
              key={pill.label}
              label={pill.label}
              value={pill.value}
              accent={pill.accent}
            />
          ))}
        </div>
      )}
      <div className="mt-6 space-y-4">
        {cards.map((card) => (
          <ExportCard
            key={card.id}
            config={card}
            feedback={exportFeedback?.scope === card.id ? exportFeedback : null}
          />
        ))}
      </div>
    </article>
  );
}

type ExportCardProps = {
  config: ExportCardConfig;
  feedback: ExportFeedbackPayload;
};

function ExportCard({ config, feedback }: ExportCardProps) {
  const isDisabled = config.isDataLoading || config.isEmpty || config.isLoading;
  return (
    <div className="rounded-3xl border border-dashed border-black/15 bg-white/80 px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
        Plantilla disponible
      </p>
      <h4 className="mt-2 text-base font-semibold text-[var(--foreground)]">
        {config.title}
      </h4>
      <p className="mt-1 text-sm text-[var(--foreground)]">
        {config.description}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={config.onClick}
          disabled={isDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download
            className={`size-4 ${config.isLoading ? "animate-pulse" : ""}`}
          />
          {config.isLoading
            ? config.loadingLabel
            : config.isEmpty
              ? config.emptyLabel
              : config.buttonLabel}
        </button>
        {feedback ? (
          <span
            className={`text-sm ${
              feedback.message.type === "error"
                ? "text-[#c0392b]"
                : "text-[#1f8f58]"
            }`}
          >
            {feedback.message.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
