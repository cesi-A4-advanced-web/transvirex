import type { DeliveryStatus } from '@generated/prisma';

export type UpdateDeliveryDto = {
    invoices_id?: string;
    reference?: string;
    driver_id?: string | null;
    status?: DeliveryStatus;
    notes?: string | null;
    scheduled_at?: string;
    position_history?: unknown;
};
