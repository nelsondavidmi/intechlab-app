import type { Job } from "@/types/job";

export const mockJobs: Job[] = [
    {
        id: "lab-001",
        patientName: "María Fernanda Gómez",
        treatment: "Carillas cerámicas - Superior",
        dentist: "Dra. Alejandra Ruiz",
        dueDate: new Date().toISOString(),
        assignedTo: "Carlos",
        status: "en-proceso",
        priority: "alta",
        notes: "Alinear tono con referencia Vita A2",
    },
    {
        id: "lab-002",
        patientName: "Daniel Pereira",
        treatment: "Corona Zirconio 2M",
        dentist: "Dr. Benjamín Ulloa",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        assignedTo: "Ana",
        status: "pendiente",
        priority: "media",
        notes: "Enviar foto para aprobación",
    },
    {
        id: "lab-003",
        patientName: "Lucía Hernández",
        treatment: "Incrustación Inlay",
        dentist: "Dra. Sofía Carpio",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        assignedTo: "Diego",
        status: "listo",
        priority: "baja",
        notes: "Empaque con kit de mantenimiento",
    },
];
