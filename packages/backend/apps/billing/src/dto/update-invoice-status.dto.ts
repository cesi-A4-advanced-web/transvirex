import type { InvoiceStatus } from '@generated/prisma';

export type UpdateInvoiceStatusDto = {
    status: InvoiceStatus;
};
