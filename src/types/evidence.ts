export type EvidencePayload = {
    note: string;
    file: File | null;
};

export type DeliveryPayload = {
    note: string;
    files: File[];
};
