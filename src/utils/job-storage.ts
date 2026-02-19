import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "@/lib/firebase/client";
import { sanitizeFileName } from "./file";

export async function uploadEvidenceAsset(jobId: string, file: File) {
    const fileData = await uploadJobFile(jobId, file, "work-evidence");
    return fileData.downloadUrl;
}

export async function uploadDeliveryAsset(
    jobId: string,
    file: File,
    uploadedBy: string,
) {
    const fileData = await uploadJobFile(jobId, file, "delivery-evidence");
    return {
        fileName: fileData.fileName,
        downloadUrl: fileData.downloadUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        contentType: fileData.contentType,
    };
}

export async function uploadJobFile(jobId: string, file: File, folder: string) {
    if (!storage) {
        throw new Error("Configura Firebase Storage para subir evidencia.");
    }

    const safeName = sanitizeFileName(file.name);
    const evidenceRef = ref(
        storage,
        `jobs/${jobId}/${folder}/${Date.now()}-${safeName}`,
    );

    await uploadBytes(evidenceRef, file, {
        contentType: file.type || "application/octet-stream",
    });

    const downloadUrl = await getDownloadURL(evidenceRef);
    return {
        downloadUrl,
        fileName: file.name || safeName,
        contentType: file.type || undefined,
    };
}
