import type { InvoicePriority, InvoiceServiceType } from '@generated/prisma';

export type UpdateInvoiceDto = {
    customer_id?: string;
    hub_id?: string;
    pickup_address_id?: string;
    delivery_address_id?: string;
    business_manager_id?: string;
    reference?: string;
    priority?: InvoicePriority;
    due_date?: string;
    service_type?: InvoiceServiceType;
    payment_date?: string | null;
};
