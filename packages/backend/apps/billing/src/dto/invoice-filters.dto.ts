import type { InvoiceStatus } from '@generated/prisma';

export type InvoiceFiltersDto = {
    status?: InvoiceStatus;
    customer_id?: string;
    hub_id?: string;
    due_date_from?: string;
    due_date_to?: string;
};
