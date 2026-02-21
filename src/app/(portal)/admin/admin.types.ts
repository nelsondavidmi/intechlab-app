export type AdminTab = "cases" | "technicians" | "dentists";

export type ExportScope = "cases" | "technicians" | "dentists";

export type StatusSummary = {
    total: number;
    pending: number;
    inProgress: number;
    ready: number;
    delivered: number;
};
