import type { Job, JobStatus } from "@/types/job";

export const statusConfig = {
    pendiente: { label: "Pendiente", bg: "bg-[#fff4de]", text: "text-[#b77516]" },
    "en-proceso": {
        label: "En proceso",
        bg: "bg-[#e4f0ff]",
        text: "text-[#1f4db8]",
    },
    listo: { label: "Listo", bg: "bg-[#dff3e3]", text: "text-[#1f8f58]" },
    entregado: { label: "Entregado", bg: "bg-[#e9e9e9]", text: "text-[#5d5d5d]" },
} as const;

export const statusOrder: JobStatus[] = [
    "pendiente",
    "en-proceso",
    "listo",
    "entregado",
];

export const skeletonJobs: Job[] = Array.from({ length: 3 }).map((_, index) => ({
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
