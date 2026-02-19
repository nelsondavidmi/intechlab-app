import { JOB_STATUS } from "./job-status";
import type { Job, JobStatus } from "@/types/job";

export const statusConfig: Record<
    JobStatus,
    { label: string; bg: string; text: string }
> = {
    [JOB_STATUS.PENDING]: {
        label: "Pendiente",
        bg: "bg-[#fff4de]",
        text: "text-[#b77516]",
    },
    [JOB_STATUS.IN_PROGRESS]: {
        label: "En proceso",
        bg: "bg-[#e4f0ff]",
        text: "text-[#1f4db8]",
    },
    [JOB_STATUS.READY]: {
        label: "Listo",
        bg: "bg-[#dff3e3]",
        text: "text-[#1f8f58]",
    },
    [JOB_STATUS.DELIVERED]: {
        label: "Entregado",
        bg: "bg-[#e9e9e9]",
        text: "text-[#5d5d5d]",
    },
};

export const statusOrder: JobStatus[] = [
    JOB_STATUS.PENDING,
    JOB_STATUS.IN_PROGRESS,
    JOB_STATUS.READY,
    JOB_STATUS.DELIVERED,
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
    status: JOB_STATUS.PENDING,
    priority: "media",
}));
