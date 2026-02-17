"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/lib/firebase/client";
import type { NewJobInput } from "@/types/job";

const newJobSchema = z.object({
    patientName: z.string().min(3),
    treatment: z.string().min(3),
    dentist: z.string().min(3),
    dueDate: z.string().min(10),
    assignedTo: z.string().min(2),
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
        status: "pendiente",
        dueDate: Timestamp.fromDate(new Date(data.dueDate)),
        createdAt: serverTimestamp(),
    });
}
