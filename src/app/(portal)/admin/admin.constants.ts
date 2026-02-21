import type {
    DentistFormState,
    TechnicianFormState,
} from "@/components/admin";
import { DEFAULT_PHONE_COUNTRY } from "@/constants/phone-country";
import type { NewJobInput } from "@/types/job";

import type { AdminTab } from "./admin.types";
import { formatDateInputValue } from "./admin.utils";

export const ADMIN_TABS: Array<{
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

export const EXPORT_PALETTE = {
    dark: "FF0B0D13",
    muted: "FF7A869A",
    border: "FFE5E7EB",
    light: "FFFDFCFB",
    stripe: "FFF8F7FC",
} as const;

export const DEFAULT_JOB: NewJobInput = {
    patientName: "",
    treatment: "",
    dentist: "",
    arrivalDate: formatDateInputValue(new Date()),
    dueDate: "",
    assignedTo: "",
    assignedToName: "",
    priority: "media",
    notes: "",
};

export const DEFAULT_TECHNICIAN: TechnicianFormState = {
    name: "",
    email: "",
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "worker",
};

export const DEFAULT_DENTIST: DentistFormState = {
    name: "",
    email: "",
    phoneCountry: DEFAULT_PHONE_COUNTRY,
    phoneNumber: "",
    password: "",
    confirmPassword: "",
};
