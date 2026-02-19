"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/lib/firebase/client";
import { JOB_STATUS } from "@/constants/job-status";
import type { NewJobInput } from "@/types/job";

const newJobSchema = z.object({
    patientName: z.string().min(3),
    treatment: z.string().min(3),
    dentist: z.string().min(3),
    arrivalDate: z.string().min(10),
    dueDate: z.string().min(10),
    assignedTo: z.string().email(),
    assignedToName: z.string().min(2).optional(),
    priority: z.enum(["alta", "media", "baja"]),
    notes: z.string().optional(),
});

export async function createJob(payload: NewJobInput) {
    if (!db) {
        throw new Error("Configura Firebase para poder crear trabajos.");
    }

    const data = newJobSchema.parse(payload);

    await addDoc(collection(db, "jobs"), {
        ...data,
        status: JOB_STATUS.PENDING,
        arrivalDate: Timestamp.fromDate(new Date(data.arrivalDate)),
        dueDate: Timestamp.fromDate(new Date(data.dueDate)),
        assignedToName: data.assignedToName ?? null,
        createdAt: serverTimestamp(),
    });
}
