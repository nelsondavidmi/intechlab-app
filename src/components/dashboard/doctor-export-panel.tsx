"use client";

import { Download } from "lucide-react";

import type { StatusSummary } from "@/app/(portal)/admin/admin.types";

export type DoctorExportFeedback = {
  type: "success" | "error";
  text: string;
} | null;

export type DoctorExportPanelProps = {
  summary: StatusSummary;
  isLoading: boolean;
  isExporting: boolean;
  hasJobs: boolean;
  onExport: () => void;
  feedback: DoctorExportFeedback;
};

export function DoctorExportPanel({
  summary,
  isLoading,
  isExporting,
  hasJobs,
  onExport,
  feedback,
}: DoctorExportPanelProps) {
  const statusCards = [
    {
      label: "Pendientes",
      value: summary.pending,
      accent: "bg-[#fff5e6] text-[#c07a00]",
    },
    {
      label: "En proceso",
      value: summary.inProgress,
      accent: "bg-[#eef5ff] text-[#1d5fd1]",
    },
    {
      label: "Listos",
      value: summary.ready,
      accent: "bg-[#effaf3] text-[#1d8b4d]",
    },
    {
      label: "Entregados",
      value: summary.delivered,
      accent: "bg-[#f6f1ff] text-[#6c3db8]",
    },
  ];

  const disabled = isLoading || !hasJobs || isExporting;

  return (
    <section className="rounded-3xl border border-black/10 bg-gradient-to-br from-white via-white to-[#f7f8fb] p-6 shadow-[0_20px_50px_rgba(26,18,11,0.09)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            Resumen de tus casos
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {isLoading
              ? "Sincronizando..."
              : `${summary.total} casos registrados`}
          </h2>
          <p className="text-sm text-muted">
            Descarga un Excel con todos tus casos listos para compartir.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onExport}
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download
              className={`size-4 ${isExporting ? "animate-pulse" : ""}`}
            />
            {isExporting
              ? "Generando archivo..."
              : hasJobs
                ? "Exportar casos"
                : "Sin casos disponibles"}
          </button>
          {feedback ? (
            <span
              className={`text-sm ${
                feedback.type === "error" ? "text-[#c0392b]" : "text-[#1f8f58]"
              }`}
            >
              {feedback.text}
            </span>
          ) : null}
        </div>
      </div>
      {!isLoading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold ${card.accent}`}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">
                {card.label}
              </p>
              <p className="mt-2 text-2xl text-black/80">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
