export type TechnicianRole = "admin" | "worker";

export interface Technician {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
    role: TechnicianRole;
}
