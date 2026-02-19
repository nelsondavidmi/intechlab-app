import type { JobStatus } from "@/types/job";

import { statusOrder } from "@/constants";

export function getNextStatus(status: JobStatus): JobStatus | null {
    const index = statusOrder.indexOf(status);
    if (index === -1 || index === statusOrder.length - 1) return null;
    return statusOrder[index + 1];
}
