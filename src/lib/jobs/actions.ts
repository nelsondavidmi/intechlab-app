"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { JobStatus } from "@/types/job";

export async function updateJobStatus(jobId: string, newStatus: JobStatus) {
    if (!db) {
        throw new Error("Firebase no está configurado.");
    }

    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
        status: newStatus,
    });
}
