import type { DeliveryStatus } from '@generated/prisma';

export type CreateDeliveryDto = {
    invoices_id: string;
    reference?: string;
    driver_id?: string;
    status?: DeliveryStatus;
    notes?: string;
    scheduled_at?: string;
    position_history?: unknown;
};
