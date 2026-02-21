import { statusConfig } from "@/constants";
import { formatDateTime } from "@/utils/formatters";
import type { Dentist } from "@/types/dentist";
import type { Job } from "@/types/job";
import type { Technician } from "@/types/technician";

import { EXPORT_PALETTE } from "./admin.constants";
import type { StatusSummary } from "./admin.types";

async function loadXLSX() {
    const module = await import("xlsx-js-style");
    return module.default ?? module;
}

type XLSXModule = Awaited<ReturnType<typeof loadXLSX>>;
type Workbook = ReturnType<XLSXModule["utils"]["book_new"]>;

function createBorderStyle() {
    const brand = EXPORT_PALETTE;
    return {
        top: { style: "thin", color: { rgb: brand.border } },
        bottom: { style: "thin", color: { rgb: brand.border } },
        left: { style: "thin", color: { rgb: brand.border } },
        right: { style: "thin", color: { rgb: brand.border } },
    } as const;
}

function createSummaryColumnGroups(columnsCount: number, groupsCount: number) {
    const baseSpan = Math.floor(columnsCount / groupsCount);
    const remainder = columnsCount % groupsCount;
    const groups: Array<{ start: number; end: number }> = [];
    let currentStart = 0;

    for (let index = 0; index < groupsCount; index += 1) {
        if (currentStart >= columnsCount) {
            groups.push({ start: columnsCount - 1, end: columnsCount - 1 });
            continue;
        }

        const extra = index < remainder ? 1 : 0;
        const span = Math.max(1, baseSpan) + extra;
        const start = currentStart;
        const end = Math.min(columnsCount - 1, start + span - 1);
        groups.push({ start, end });
        currentStart = end + 1;
    }

    return groups;
}

function triggerDownload(XLSX: XLSXModule, workbook: Workbook, fileName: string) {
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
}

export async function exportCasesReport(
    jobs: Job[],
    statusSummary: StatusSummary,
) {
    const XLSX = await loadXLSX();
    const workbook = XLSX.utils.book_new();
    const generatedAt = new Date();
    const headerLabels = [
        "Paciente",
        "Doctor tratante",
        "Laboratorista asignado",
        "Estado",
        "Fecha de llegada",
        "Fecha de entrega",
        "Notas",
    ];
    const columnsCount = headerLabels.length;
    const columnWidths = [28, 26, 26, 16, 22, 22, 40];
    const brand = EXPORT_PALETTE;
    const borderStyle = createBorderStyle();
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
    const summaryBlocks = [
        { label: "Pendientes", value: statusSummary.pending, fill: "FFFDF4E3" },
        { label: "En proceso", value: statusSummary.inProgress, fill: "FFEFF5FF" },
        { label: "Listos", value: statusSummary.ready, fill: "FFEFFAF3" },
        { label: "Entregados", value: statusSummary.delivered, fill: "FFF6F1FF" },
    ] as const;

    const summaryColumnGroups = createSummaryColumnGroups(
        columnsCount,
        summaryBlocks.length,
    );

    sheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: columnsCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: columnsCount - 1 } },
        ...summaryColumnGroups.map((group) => ({
            s: { r: 2, c: group.start },
            e: { r: 3, c: group.end },
        })),
    ];

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

    const summaryRowTop = 2;
    summaryBlocks.forEach((block, index) => {
        const group = summaryColumnGroups[index];
        const colStart = group?.start ?? 0;
        const cellRef = XLSX.utils.encode_cell({ r: summaryRowTop, c: colStart });
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
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: columnIndex });
        const cell = sheet[cellRef];
        if (!cell) return;
        cell.s = {
            font: { bold: true, color: { rgb: "FFFFFFFF" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            fill: { patternType: "solid", fgColor: { rgb: brand.dark } },
            border: borderStyle,
        };
    });

    const dataRows = jobs.map((job) => [
        job.patientName,
        job.dentist || "Sin asignar",
        job.assignedToName || job.assignedTo || "Sin asignar",
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
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
            const cell = sheet[cellRef];
            if (!cell) return;
            cell.s = {
                font: { color: { rgb: brand.dark } },
                alignment: {
                    vertical: "center",
                    horizontal: columnIndex >= 3 && columnIndex <= 5 ? "center" : "left",
                    wrapText: columnIndex === 6,
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
    const lastColumnLetter = XLSX.utils.encode_col(columnsCount - 1);
    sheet["!autofilter"] = {
        ref: `A${headerRowNumber}:${lastColumnLetter}${totalRowCount || headerRowNumber}`,
    };

    XLSX.utils.book_append_sheet(workbook, sheet, "Casos");
    triggerDownload(
        XLSX,
        workbook,
        `intechlab-casos-${generatedAt.toISOString().slice(0, 10)}.xlsx`,
    );
}

export async function exportTechniciansDirectory(technicians: Technician[]) {
    const XLSX = await loadXLSX();
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
    const brand = EXPORT_PALETTE;
    const borderStyle = createBorderStyle();
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
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: columnIndex });
        const cell = sheet[cellRef];
        if (!cell) return;
        cell.s = {
            font: { bold: true, color: { rgb: "FFFFFFFF" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
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
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
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

    XLSX.utils.book_append_sheet(workbook, sheet, "Laboratoristas");
    triggerDownload(
        XLSX,
        workbook,
        `intechlab-laboratoristas-${generatedAt.toISOString().slice(0, 10)}.xlsx`,
    );
}

export async function exportDentistsDirectory(dentists: Dentist[]) {
    const XLSX = await loadXLSX();
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
    const brand = EXPORT_PALETTE;
    const borderStyle = createBorderStyle();
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
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: columnIndex });
        const cell = sheet[cellRef];
        if (!cell) return;
        cell.s = {
            font: { bold: true, color: { rgb: "FFFFFFFF" } },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
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
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
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
    triggerDownload(
        XLSX,
        workbook,
        `intechlab-doctores-${generatedAt.toISOString().slice(0, 10)}.xlsx`,
    );
}
