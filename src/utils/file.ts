export function mergeFilesBySignature(existing: File[], nextFiles: File[]) {
    const signature = (file: File) =>
        `${file.name}-${file.size}-${file.lastModified}`;
    const map = new Map<string, File>();
    existing.forEach((file) => map.set(signature(file), file));
    nextFiles.forEach((file) => map.set(signature(file), file));
    return Array.from(map.values());
}

export function sanitizeFileName(name: string) {
    const base = name?.trim() || `archivo-${Date.now()}`;
    return base.replace(/[^a-zA-Z0-9.]+/g, "-").toLowerCase();
}
