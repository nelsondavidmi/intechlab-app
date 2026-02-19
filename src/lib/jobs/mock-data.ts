import { JOB_STATUS } from "@/constants/job-status";
import type { Job } from "@/types/job";

export const mockJobs: Job[] = [
    {
        id: "lab-001",
        patientName: "María Fernanda Gómez",
        treatment: "Carillas cerámicas - Superior",
        dentist: "Dra. Alejandra Ruiz",
        arrivalDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        dueDate: new Date().toISOString(),
        assignedTo: "carlos@intechlab.dev",
        assignedToName: "Carlos",
        status: JOB_STATUS.IN_PROGRESS,
        priority: "alta",
        notes: "Alinear tono con referencia Vita A2",
    },
    {
        id: "lab-002",
        patientName: "Daniel Pereira",
        treatment: "Corona Zirconio 2M",
        dentist: "Dr. Benjamín Ulloa",
        arrivalDate: new Date(Date.now() - 86400000).toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        assignedTo: "ana@intechlab.dev",
        assignedToName: "Ana",
        status: JOB_STATUS.PENDING,
        priority: "media",
        notes: "Enviar foto para aprobación",
    },
    {
        id: "lab-003",
        patientName: "Lucía Hernández",
        treatment: "Incrustación Inlay",
        dentist: "Dra. Sofía Carpio",
        arrivalDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        assignedTo: "diego@intechlab.dev",
        assignedToName: "Diego",
        status: JOB_STATUS.READY,
        priority: "baja",
        notes: "Empaque con kit de mantenimiento",
        completionEvidence: {
            note: "Pulido finalizado y empaquetado con sellado térmico.",
            submittedBy: "diego@intechlab.dev",
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            attachments: [
                {
                    fileName: "evidencia-1.jpg",
                    downloadUrl:
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
                    uploadedBy: "diego@intechlab.dev",
                    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
                    contentType: "image/jpeg",
                },
            ],
        },
        deliveryEvidence: {
            note: "Factura y guía adjuntas.",
            submittedBy: "admin@intechlab.dev",
            submittedAt: new Date().toISOString(),
            attachments: [
                {
                    fileName: "Factura-4781.pdf",
                    downloadUrl: "https://example.com/factura.pdf",
                    uploadedBy: "admin@intechlab.dev",
                    uploadedAt: new Date().toISOString(),
                    contentType: "application/pdf",
                },
            ],
        },
    },
];
