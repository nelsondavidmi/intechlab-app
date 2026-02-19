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
import type { EvidenceAttachment, Job, JobStatus } from "@/types/job";
import { mockJobs } from "@/lib/jobs/mock-data";
import { JOB_STATUS } from "@/constants/job-status";

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
                [JOB_STATUS.PENDING]: [],
                [JOB_STATUS.IN_PROGRESS]: [],
                [JOB_STATUS.READY]: [],
                [JOB_STATUS.DELIVERED]: [],
            }
        );
    }, [jobs]);

    return { jobs, groupedByStatus, loading };
}

function normalizeJob(id: string, data: DocumentData): Job {
    const evidence = data.completionEvidence;
    const delivery = data.deliveryEvidence;

    const completionEvidence = evidence
        ? (() => {
            const submittedAt =
                evidence.submittedAt?.toDate?.().toISOString?.() ??
                evidence.submittedAt ??
                "";
            let attachments = mapAttachments(
                evidence.attachments,
                evidence.submittedBy ?? "",
            );

            if (!attachments.length && typeof evidence.imageUrl === "string") {
                attachments = [
                    {
                        fileName: String(evidence.fileName ?? "evidencia"),
                        downloadUrl: evidence.imageUrl,
                        uploadedBy: String(evidence.submittedBy ?? ""),
                        uploadedAt: submittedAt,
                        contentType: undefined,
                    },
                ];
            }

            return {
                note: evidence.note ?? "",
                submittedBy: evidence.submittedBy ?? "",
                submittedAt,
                attachments,
            };
        })()
        : undefined;

    const deliveryEvidence = delivery
        ? {
            note: delivery.note ?? undefined,
            submittedBy: delivery.submittedBy ?? "",
            submittedAt:
                delivery.submittedAt?.toDate?.().toISOString?.() ??
                delivery.submittedAt ??
                "",
            attachments: mapAttachments(
                delivery.attachments,
                delivery.submittedBy ?? "",
            ),
        }
        : undefined;

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
        status: data.status ?? JOB_STATUS.PENDING,
        priority: data.priority ?? "media",
        notes: data.notes,
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt,
        completionEvidence,
        deliveryEvidence,
    };
}

function mapAttachments(
    attachments: unknown,
    fallbackUploader: string,
): EvidenceAttachment[] {
    if (!Array.isArray(attachments)) {
        return [];
    }

    return attachments.map((item) => {
        const record = item as Record<string, unknown>;
        const uploadedAtSource = record.uploadedAt as
            | string
            | { toDate?: () => Date }
            | undefined;
        const uploadedAt = (() => {
            if (
                uploadedAtSource &&
                typeof uploadedAtSource === "object" &&
                "toDate" in uploadedAtSource &&
                typeof uploadedAtSource.toDate === "function"
            ) {
                const value = uploadedAtSource.toDate();
                return value?.toISOString?.() ?? "";
            }

            if (typeof uploadedAtSource === "string") {
                return uploadedAtSource;
            }

            return "";
        })();

        return {
            fileName: String(record.fileName ?? "archivo"),
            downloadUrl: String(record.downloadUrl ?? record.url ?? ""),
            uploadedBy: String(record.uploadedBy ?? fallbackUploader ?? ""),
            uploadedAt,
            contentType:
                typeof record.contentType === "string"
                    ? record.contentType
                    : undefined,
        } satisfies EvidenceAttachment;
    });
}
