import { JOB_STATUS } from "@/constants/job-status";

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export interface EvidenceAttachment {
    fileName: string;
    downloadUrl: string;
    uploadedAt: string;
    uploadedBy: string;
    contentType?: string;
}

export interface CompletionEvidence {
    note: string;
    attachments: EvidenceAttachment[];
    submittedAt: string;
    submittedBy: string;
}

export interface DeliveryEvidence {
    note?: string;
    attachments: EvidenceAttachment[];
    submittedAt: string;
    submittedBy: string;
}

export interface Job {
    id: string;
    patientName: string;
    treatment: string;
    dentist: string;
    arrivalDate: string;
    dueDate: string;
    assignedTo: string;
    assignedToName?: string;
    status: JobStatus;
    priority: "alta" | "media" | "baja";
    notes?: string;
    createdAt?: string;
    completionEvidence?: CompletionEvidence;
    deliveryEvidence?: DeliveryEvidence;
}

export interface NewJobInput {
    patientName: string;
    treatment: string;
    dentist: string;
    arrivalDate: string;
    dueDate: string;
    assignedTo: string;
    assignedToName?: string;
    priority: "alta" | "media" | "baja";
    notes?: string;
}
