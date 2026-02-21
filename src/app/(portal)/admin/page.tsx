"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

import {
  CaseForm,
  DentistForm,
  DentistsList,
  TechnicianForm,
  TechniciansList,
} from "@/components/admin";
import { PortalShell, VerifySession } from "@/components/dashboard";
import { JOB_STATUS, statusConfig } from "@/constants";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRY_DIGITS,
  PHONE_COUNTRY_LABELS,
  type PhoneCountryCode,
} from "@/constants/phone-country";
import { useJobs } from "@/hooks/use-jobs";
import { useTechnicians } from "@/hooks/use-technicians";
import { useDentists } from "@/hooks/use-dentists";
import { createJob } from "@/lib/jobs/mutations";
import { useAuth } from "@/providers/auth-provider";
import { formatContactLabel } from "@/utils/format-contact-label";
import { formatDateTime } from "@/utils/formatters";
import type { NewJobInput } from "@/types/job";
import type {
  DentistFormState,
  FormMessage,
  TechnicianFormState,
} from "@/components/admin";

type AdminTab = "cases" | "technicians" | "dentists";
type ExportScope = "cases" | "technicians" | "dentists";

const adminTabs: Array<{
  id: AdminTab;
  label: string;
  description: string;
}> = [
  {
    id: "cases",
    label: "Casos",
    description: "Registro y estado global",
  },
  {
    id: "technicians",
    label: "Laboratoristas",
    description: "Registro y equipo registrado",
  },
  {
    id: "dentists",
    label: "Doctores",
    description: "Registro y equipo médico",
  },
];

const exportPalette = {
  dark: "FF0B0D13",
  muted: "FF7A869A",
  border: "FFE5E7EB",
  light: "FFFDFCFB",
  stripe: "FFF8F7FC",
} as const;

const dateInputValue = (value: Date) => {
  const offsetMinutes = value.getTimezoneOffset();
  const localTime = new Date(value.getTime() - offsetMinutes * 60000);
  return localTime.toISOString().slice(0, 16);
};

const defaultJob: NewJobInput = {
  patientName: "",
  treatment: "",
  dentist: "",
  arrivalDate: dateInputValue(new Date()),
  dueDate: "",
  assignedTo: "",
  assignedToName: "",
  priority: "media",
  notes: "",
};

const defaultTechnician: TechnicianFormState = {
  name: "",
  email: "",
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "worker",
};

const defaultDentist: DentistFormState = {
  name: "",
  email: "",
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

function buildPhoneNumber(
  country: PhoneCountryCode,
  digits: string,
): string | null {
  const sanitized = digits.replace(/[^\d]/g, "");
  const expected = PHONE_COUNTRY_DIGITS[country];
  if (!sanitized || sanitized.length !== expected) {
    return null;
  }
  return `${country} ${sanitized}`;
}

function phoneErrorMessage(country: PhoneCountryCode) {
  const label = PHONE_COUNTRY_LABELS[country];
  const digits = PHONE_COUNTRY_DIGITS[country];
  return `Ingresa un teléfono válido de ${label} con ${digits} dígitos.`;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string) {
  return emailRegex.test(value.trim());
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin, token } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { dentists, loading: dentistsLoading } = useDentists();
  const [jobDraft, setJobDraft] = useState(defaultJob);
  const [activeTab, setActiveTab] = useState<AdminTab>("cases");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);
  const [technicianDraft, setTechnicianDraft] =
    useState<TechnicianFormState>(defaultTechnician);
  const [isSavingTechnician, setIsSavingTechnician] = useState(false);
  const [technicianMessage, setTechnicianMessage] = useState<FormMessage>(null);
  const [deletingTechnicianId, setDeletingTechnicianId] = useState<
    string | null
  >(null);
  const [dentistDraft, setDentistDraft] =
    useState<DentistFormState>(defaultDentist);
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
  const statusSummary = useMemo(() => {
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
      const XLSXModule = await import("xlsx-js-style");
      const XLSX = XLSXModule.default ?? XLSXModule;
      const workbook = XLSX.utils.book_new();
      const generatedAt = new Date();

      const columnsCount = 8;
      const columnWidths = [28, 26, 26, 14, 16, 22, 22, 40];
      const headerLabels = [
        "Paciente",
        "Doctor tratante",
        "Laboratorista asignado",
        "Prioridad",
        "Estado",
        "Fecha de llegada",
        "Fecha de entrega",
        "Notas",
      ];
      const brand = exportPalette;

      const fillerRow = Array(columnsCount - 1).fill(null);
      const rows: Array<Array<string | null>> = [
        ["Reporte global de casos", ...fillerRow],
        [
          `Generado el ${new Intl.DateTimeFormat("es-PE", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(generatedAt)}`,
          ...fillerRow,
        ],
        Array(columnsCount).fill(null),
        Array(columnsCount).fill(null),
        Array(columnsCount).fill(null),
        headerLabels,
      ];

      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = columnWidths.map((wch) => ({ wch }));
      sheet["!rows"] = [
        { hpt: 34 },
        { hpt: 20 },
        { hpt: 70 },
        { hpt: 70 },
        { hpt: 16 },
        { hpt: 26 },
      ];
      sheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnsCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: columnsCount - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 3, c: 1 } },
        { s: { r: 2, c: 2 }, e: { r: 3, c: 3 } },
        { s: { r: 2, c: 4 }, e: { r: 3, c: 5 } },
        { s: { r: 2, c: 6 }, e: { r: 3, c: 7 } },
      ];

      const borderStyle = {
        top: { style: "thin", color: { rgb: brand.border } },
        bottom: { style: "thin", color: { rgb: brand.border } },
        left: { style: "thin", color: { rgb: brand.border } },
        right: { style: "thin", color: { rgb: brand.border } },
      } as const;

      const titleCell = sheet["A1"];
      if (titleCell) {
        titleCell.s = {
          font: { sz: 18, bold: true, color: { rgb: brand.dark } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { patternType: "solid", fgColor: { rgb: brand.light } },
          border: borderStyle,
        };
      }
      const subtitleCell = sheet["A2"];
      if (subtitleCell) {
        subtitleCell.s = {
          font: { sz: 12, color: { rgb: brand.muted } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            bottom: borderStyle.bottom,
            left: borderStyle.left,
            right: borderStyle.right,
          },
        };
      }

      const summaryBlocks = [
        { label: "Pendientes", value: statusSummary.pending, fill: "FFFDF4E3" },
        {
          label: "En proceso",
          value: statusSummary.inProgress,
          fill: "FFEFF5FF",
        },
        { label: "Listos", value: statusSummary.ready, fill: "FFEFFAF3" },
        {
          label: "Entregados",
          value: statusSummary.delivered,
          fill: "FFF6F1FF",
        },
      ] as const;
      const summaryRowTop = 2;
      summaryBlocks.forEach((block, index) => {
        const colStart = index * 2;
        const cellRef = XLSX.utils.encode_cell({
          r: summaryRowTop,
          c: colStart,
        });
        const cell = sheet[cellRef] ?? { t: "s", v: "" };
        cell.v = `${block.label.toUpperCase()}\n${block.value}`;
        cell.s = {
          font: { sz: 12, bold: true, color: { rgb: brand.dark } },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          fill: { patternType: "solid", fgColor: { rgb: block.fill } },
          border: borderStyle,
        };
        sheet[cellRef] = cell;
      });

      const headerRowIndex = 5;
      headerLabels.forEach((_, columnIndex) => {
        const cellRef = XLSX.utils.encode_cell({
          r: headerRowIndex,
          c: columnIndex,
        });
        const cell = sheet[cellRef];
        if (!cell) return;
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFFFF" } },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          fill: { patternType: "solid", fgColor: { rgb: brand.dark } },
          border: borderStyle,
        };
      });

      const priorityLabels: Record<NewJobInput["priority"], string> = {
        alta: "Alta",
        media: "Media",
        baja: "Baja",
      };

      const dataRows = jobs.map((job) => [
        job.patientName,
        job.dentist || "Sin asignar",
        job.assignedToName || job.assignedTo || "Sin asignar",
        priorityLabels[job.priority],
        statusConfig[job.status]?.label ?? job.status,
        job.arrivalDate ? formatDateTime(job.arrivalDate) : "Sin fecha",
        job.dueDate ? formatDateTime(job.dueDate) : "Sin fecha",
        job.notes || "—",
      ]);
      if (dataRows.length) {
        XLSX.utils.sheet_add_aoa(sheet, dataRows, { origin: -1 });
      }

      const firstDataRowIndex = headerRowIndex + 1;
      dataRows.forEach((_, rowOffset) => {
        const rowIndex = firstDataRowIndex + rowOffset;
        const isStriped = rowOffset % 2 === 1;
        headerLabels.forEach((_, columnIndex) => {
          const cellRef = XLSX.utils.encode_cell({
            r: rowIndex,
            c: columnIndex,
          });
          const cell = sheet[cellRef];
          if (!cell) return;
          cell.s = {
            font: { color: { rgb: brand.dark } },
            alignment: {
              vertical: "center",
              horizontal:
                columnIndex >= 4 && columnIndex <= 6 ? "center" : "left",
              wrapText: columnIndex === 7,
            },
            fill: isStriped
              ? { patternType: "solid", fgColor: { rgb: brand.stripe } }
              : undefined,
            border: borderStyle,
          };
        });
      });

      const headerRowNumber = headerRowIndex + 1;
      const totalRowCount = headerRowNumber + dataRows.length;
      sheet["!autofilter"] = {
        ref: `A${headerRowNumber}:H${totalRowCount || headerRowNumber}`,
      };

      XLSX.utils.book_append_sheet(workbook, sheet, "Casos");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `intechlab-casos-${generatedAt.toISOString().slice(0, 10)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);

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
      const XLSXModule = await import("xlsx-js-style");
      const XLSX = XLSXModule.default ?? XLSXModule;
      const workbook = XLSX.utils.book_new();
      const generatedAt = new Date();
      const headerLabels = [
        "Nombre completo",
        "Correo",
        "Teléfono",
        "Rol",
        "Registrado",
      ];
      const columnWidths = [30, 30, 22, 14, 22];
      const columnsCount = headerLabels.length;
      const fillerRow = Array(columnsCount - 1).fill(null);
      const rows: Array<Array<string | null>> = [
        ["Directorio de laboratoristas", ...fillerRow],
        [
          `Actualizado el ${new Intl.DateTimeFormat("es-PE", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(generatedAt)}`,
          ...fillerRow,
        ],
        headerLabels,
      ];

      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = columnWidths.map((wch) => ({ wch }));
      sheet["!rows"] = [{ hpt: 32 }, { hpt: 20 }, { hpt: 26 }];
      sheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnsCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: columnsCount - 1 } },
      ];

      const brand = exportPalette;
      const borderStyle = {
        top: { style: "thin", color: { rgb: brand.border } },
        bottom: { style: "thin", color: { rgb: brand.border } },
        left: { style: "thin", color: { rgb: brand.border } },
        right: { style: "thin", color: { rgb: brand.border } },
      } as const;

      const titleCell = sheet["A1"];
      if (titleCell) {
        titleCell.s = {
          font: { sz: 18, bold: true, color: { rgb: brand.dark } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { patternType: "solid", fgColor: { rgb: brand.light } },
          border: borderStyle,
        };
      }
      const subtitleCell = sheet["A2"];
      if (subtitleCell) {
        subtitleCell.s = {
          font: { sz: 12, color: { rgb: brand.muted } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            bottom: borderStyle.bottom,
            left: borderStyle.left,
            right: borderStyle.right,
          },
        };
      }

      const headerRowIndex = 2;
      headerLabels.forEach((_, columnIndex) => {
        const cellRef = XLSX.utils.encode_cell({
          r: headerRowIndex,
          c: columnIndex,
        });
        const cell = sheet[cellRef];
        if (!cell) return;
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFFFF" } },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          fill: { patternType: "solid", fgColor: { rgb: brand.dark } },
          border: borderStyle,
        };
      });

      const dataRows = technicians.map((tech) => [
        tech.name,
        tech.email ?? "Sin correo",
        tech.phone ?? "No registrado",
        tech.role === "admin" ? "Administrador" : "Laboratorista",
        tech.createdAt ? formatDateTime(tech.createdAt) : "Sin fecha",
      ]);

      if (dataRows.length) {
        XLSX.utils.sheet_add_aoa(sheet, dataRows, { origin: -1 });
      }

      const firstDataRowIndex = headerRowIndex + 1;
      dataRows.forEach((_, rowOffset) => {
        const rowIndex = firstDataRowIndex + rowOffset;
        const isStriped = rowOffset % 2 === 1;
        headerLabels.forEach((_, columnIndex) => {
          const cellRef = XLSX.utils.encode_cell({
            r: rowIndex,
            c: columnIndex,
          });
          const cell = sheet[cellRef];
          if (!cell) return;
          cell.s = {
            font: { color: { rgb: brand.dark } },
            alignment: {
              vertical: "center",
              horizontal: columnIndex === 2 ? "center" : "left",
              wrapText: columnIndex >= 0,
            },
            fill: isStriped
              ? { patternType: "solid", fgColor: { rgb: brand.stripe } }
              : undefined,
            border: borderStyle,
          };
        });
      });

      const headerRowNumber = headerRowIndex + 1;
      const totalRowCount = headerRowNumber + dataRows.length;
      sheet["!autofilter"] = {
        ref: `A${headerRowNumber}:E${totalRowCount || headerRowNumber}`,
      };

      XLSX.utils.book_append_sheet(workbook, sheet, "Laboratoristas");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `intechlab-laboratoristas-${generatedAt
        .toISOString()
        .slice(0, 10)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);

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
      const XLSXModule = await import("xlsx-js-style");
      const XLSX = XLSXModule.default ?? XLSXModule;
      const workbook = XLSX.utils.book_new();
      const generatedAt = new Date();
      const headerLabels = [
        "Nombre completo",
        "Correo",
        "Teléfono",
        "Rol",
        "Registrado",
      ];
      const columnWidths = [30, 30, 22, 14, 22];
      const columnsCount = headerLabels.length;
      const fillerRow = Array(columnsCount - 1).fill(null);
      const rows: Array<Array<string | null>> = [
        ["Directorio de doctores", ...fillerRow],
        [
          `Actualizado el ${new Intl.DateTimeFormat("es-PE", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(generatedAt)}`,
          ...fillerRow,
        ],
        headerLabels,
      ];

      const sheet = XLSX.utils.aoa_to_sheet(rows);
      sheet["!cols"] = columnWidths.map((wch) => ({ wch }));
      sheet["!rows"] = [{ hpt: 32 }, { hpt: 20 }, { hpt: 26 }];
      sheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnsCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: columnsCount - 1 } },
      ];

      const brand = exportPalette;
      const borderStyle = {
        top: { style: "thin", color: { rgb: brand.border } },
        bottom: { style: "thin", color: { rgb: brand.border } },
        left: { style: "thin", color: { rgb: brand.border } },
        right: { style: "thin", color: { rgb: brand.border } },
      } as const;

      const titleCell = sheet["A1"];
      if (titleCell) {
        titleCell.s = {
          font: { sz: 18, bold: true, color: { rgb: brand.dark } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { patternType: "solid", fgColor: { rgb: brand.light } },
          border: borderStyle,
        };
      }
      const subtitleCell = sheet["A2"];
      if (subtitleCell) {
        subtitleCell.s = {
          font: { sz: 12, color: { rgb: brand.muted } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            bottom: borderStyle.bottom,
            left: borderStyle.left,
            right: borderStyle.right,
          },
        };
      }

      const headerRowIndex = 2;
      headerLabels.forEach((_, columnIndex) => {
        const cellRef = XLSX.utils.encode_cell({
          r: headerRowIndex,
          c: columnIndex,
        });
        const cell = sheet[cellRef];
        if (!cell) return;
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFFFF" } },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          fill: { patternType: "solid", fgColor: { rgb: brand.dark } },
          border: borderStyle,
        };
      });

      const dataRows = dentists.map((dentist) => [
        dentist.name,
        dentist.email ?? "Sin correo",
        dentist.phone ?? "No registrado",
        "Doctor tratante",
        dentist.createdAt ? formatDateTime(dentist.createdAt) : "Sin fecha",
      ]);

      if (dataRows.length) {
        XLSX.utils.sheet_add_aoa(sheet, dataRows, { origin: -1 });
      }

      const firstDataRowIndex = headerRowIndex + 1;
      dataRows.forEach((_, rowOffset) => {
        const rowIndex = firstDataRowIndex + rowOffset;
        const isStriped = rowOffset % 2 === 1;
        headerLabels.forEach((_, columnIndex) => {
          const cellRef = XLSX.utils.encode_cell({
            r: rowIndex,
            c: columnIndex,
          });
          const cell = sheet[cellRef];
          if (!cell) return;
          cell.s = {
            font: { color: { rgb: brand.dark } },
            alignment: {
              vertical: "center",
              horizontal: columnIndex === 2 ? "center" : "left",
              wrapText: true,
            },
            fill: isStriped
              ? { patternType: "solid", fgColor: { rgb: brand.stripe } }
              : undefined,
            border: borderStyle,
          };
        });
      });

      const headerRowNumber = headerRowIndex + 1;
      const totalRowCount = headerRowNumber + dataRows.length;
      sheet["!autofilter"] = {
        ref: `A${headerRowNumber}:E${totalRowCount || headerRowNumber}`,
      };

      XLSX.utils.book_append_sheet(workbook, sheet, "Doctores");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `intechlab-doctores-${generatedAt
        .toISOString()
        .slice(0, 10)}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);

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
        ...defaultJob,
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
      setDentistDraft(defaultDentist);
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
            <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
              Panel administrativo
            </h1>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-[var(--foreground)]"
        >
          Volver al dashboard
        </button>
      </header>
      <nav className="mt-6 flex gap-3 overflow-x-auto border-b border-black/10 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {adminTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={isActive}
              className={`min-w-[180px] flex-shrink-0 flex flex-col rounded-2xl border px-4 py-2.5 text-left transition ${
                isActive
                  ? "border-black/80 bg-black text-white"
                  : "border-black/10 bg-white/70 text-[var(--foreground)] hover:border-black/30"
              }`}
            >
              <span className="text-sm font-semibold tracking-wide sm:text-base">
                {tab.label}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] ${
                  isActive ? "text-white/70" : "text-muted"
                }`}
              >
                {tab.description}
              </span>
            </button>
          );
        })}
      </nav>

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
                <StatusPill
                  label="Pendientes"
                  value={statusSummary.pending}
                  accent="bg-[#fff5e6] text-[#c07a00]"
                />
                <StatusPill
                  label="En proceso"
                  value={statusSummary.inProgress}
                  accent="bg-[#eef5ff] text-[#1d5fd1]"
                />
                <StatusPill
                  label="Listos"
                  value={statusSummary.ready}
                  accent="bg-[#effaf3] text-[#1d8b4d]"
                />
                <StatusPill
                  label="Entregados"
                  value={statusSummary.delivered}
                  accent="bg-[#f6f1ff] text-[#6c3db8]"
                />
              </div>
            )}
            <div className="mt-6 rounded-3xl border border-dashed border-black/15 bg-white/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
                Exportar casos
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]">
                Descarga un Excel con este resumen y todos los casos con los
                estilos de Intechlab.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleExportCases}
                  disabled={
                    jobsLoading || isExportingCases || jobs.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-50"
                >
                  <Download
                    className={`size-4 ${
                      isExportingCases ? "animate-pulse" : ""
                    }`}
                  />
                  {isExportingCases
                    ? "Generando plantilla..."
                    : "Exportar casos"}
                </button>
                {exportFeedback?.scope === "cases" ? (
                  <span
                    className={`text-sm ${
                      exportFeedback.message.type === "error"
                        ? "text-[#c0392b]"
                        : "text-[#1f8f58]"
                    }`}
                  >
                    {exportFeedback.message.text}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-dashed border-black/15 bg-white/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
                Exportar laboratoristas
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]">
                Obtén el directorio completo del equipo de laboratorio con sus
                correos, teléfonos y roles.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleExportTechnicians}
                  disabled={
                    techniciansLoading ||
                    isExportingTechnicians ||
                    technicians.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-50"
                >
                  <Download
                    className={`size-4 ${
                      isExportingTechnicians ? "animate-pulse" : ""
                    }`}
                  />
                  {isExportingTechnicians
                    ? "Generando directorio..."
                    : "Exportar laboratoristas"}
                </button>
                {exportFeedback?.scope === "technicians" ? (
                  <span
                    className={`text-sm ${
                      exportFeedback.message.type === "error"
                        ? "text-[#c0392b]"
                        : "text-[#1f8f58]"
                    }`}
                  >
                    {exportFeedback.message.text}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-4 rounded-3xl border border-dashed border-black/15 bg-white/80 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-muted">
                Exportar doctores
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]">
                Descarga la lista de doctores con la misma plantilla estilizada
                para compartirla con tu equipo.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleExportDentists}
                  disabled={
                    dentistsLoading ||
                    isExportingDentists ||
                    dentists.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-50"
                >
                  <Download
                    className={`size-4 ${
                      isExportingDentists ? "animate-pulse" : ""
                    }`}
                  />
                  {isExportingDentists
                    ? "Preparando archivo..."
                    : "Exportar doctores"}
                </button>
                {exportFeedback?.scope === "dentists" ? (
                  <span
                    className={`text-sm ${
                      exportFeedback.message.type === "error"
                        ? "text-[#c0392b]"
                        : "text-[#1f8f58]"
                    }`}
                  >
                    {exportFeedback.message.text}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
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

type StatusPillProps = {
  label: string;
  value: number;
  accent: string;
};

function StatusPill({ label, value, accent }: StatusPillProps) {
  return (
    <div className={`rounded-2xl border border-black/10 ${accent} px-4 py-3`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
