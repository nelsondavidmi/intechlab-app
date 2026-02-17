export type JobStatus = "pendiente" | "en-proceso" | "listo" | "entregado";

export interface Job {
    id: string;
    patientName: string;
    treatment: string;
    dentist: string;
    dueDate: string;
    assignedTo: string;
    status: JobStatus;
    priority: "alta" | "media" | "baja";
    notes?: string;
    createdAt?: string;
}

export interface NewJobInput {
    patientName: string;
    treatment: string;
    dentist: string;
    dueDate: string;
    assignedTo: string;
    priority: "alta" | "media" | "baja";
    notes?: string;
}
