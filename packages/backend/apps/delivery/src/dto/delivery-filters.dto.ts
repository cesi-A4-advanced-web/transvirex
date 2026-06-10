import type { DeliveryStatus } from '@generated/prisma';

export type DeliveryFiltersDto = {
    status?: DeliveryStatus;
    hub_id?: string;
    driver_id?: string;
    date_from?: string;
    date_to?: string;
};

export type DeliveryRequestUser = {
    id?: string;
    role?: string;
};
