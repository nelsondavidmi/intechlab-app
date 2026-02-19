"use client";

import { useEffect, useMemo, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
    type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Job, JobStatus } from "@/types/job";
import { mockJobs } from "@/lib/jobs/mock-data";

interface JobFilters {
    assignedTo?: string;
    status?: JobStatus[];
}

export function useJobs(filters?: JobFilters) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setJobs(mockJobs);
            setLoading(false);
            return;
        }

        const constraints = [];

        if (filters?.assignedTo) {
            constraints.push(where("assignedTo", "==", filters.assignedTo));
        }

        if (filters?.status?.length) {
            constraints.push(where("status", "in", filters.status));
        }

        const jobsQuery = query(
            collection(db, "jobs"),
            ...constraints,
            orderBy("dueDate", "asc")
        );

        const unsubscribe = onSnapshot(jobsQuery, (snapshot) => {
            const nextJobs = snapshot.docs.map((doc) => normalizeJob(doc.id, doc.data()));
            setJobs(nextJobs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filters?.assignedTo, filters?.status]);

    const groupedByStatus = useMemo(() => {
        return jobs.reduce<Record<JobStatus, Job[]>>(
            (acc, job) => {
                acc[job.status] = acc[job.status] ? [...acc[job.status], job] : [job];
                return acc;
            },
            {
                pendiente: [],
                "en-proceso": [],
                listo: [],
                entregado: [],
            }
        );
    }, [jobs]);

    return { jobs, groupedByStatus, loading };
}

function normalizeJob(id: string, data: DocumentData): Job {
    const evidence = data.completionEvidence;
    const delivery = data.deliveryEvidence;

    return {
        id,
        patientName: data.patientName ?? "Paciente sin nombre",
        treatment: data.treatment ?? "Trabajo sin descripción",
        dentist: data.dentist ?? "",
        arrivalDate:
            data.arrivalDate?.toDate?.().toISOString?.() ?? data.arrivalDate ?? "",
        dueDate: data.dueDate?.toDate?.().toISOString?.() ?? data.dueDate ?? "",
        assignedTo: data.assignedTo ?? "",
        assignedToName: data.assignedToName ?? undefined,
        status: data.status ?? "pendiente",
        priority: data.priority ?? "media",
        notes: data.notes,
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt,
        completionEvidence: evidence
            ? {
                note: evidence.note ?? "",
                imageUrl: evidence.imageUrl ?? "",
                submittedBy: evidence.submittedBy ?? "",
                submittedAt:
                    evidence.submittedAt?.toDate?.().toISOString?.() ??
                    evidence.submittedAt ??
                    "",
            }
            : undefined,
        deliveryEvidence: delivery
            ? {
                note: delivery.note ?? undefined,
                submittedBy: delivery.submittedBy ?? "",
                submittedAt:
                    delivery.submittedAt?.toDate?.().toISOString?.() ??
                    delivery.submittedAt ??
                    "",
                attachments: Array.isArray(delivery.attachments)
                    ? delivery.attachments.map((item: Record<string, unknown>) => ({
                        fileName: String(item.fileName ?? "archivo"),
                        downloadUrl: String(item.downloadUrl ?? item.url ?? ""),
                        uploadedBy: String(item.uploadedBy ?? delivery.submittedBy ?? ""),
                        uploadedAt:
                            (item.uploadedAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ??
                            (typeof item.uploadedAt === "string" ? item.uploadedAt : ""),
                        contentType:
                            typeof item.contentType === "string" ? item.contentType : undefined,
                    }))
                    : [],
            }
            : undefined,
    };
}
