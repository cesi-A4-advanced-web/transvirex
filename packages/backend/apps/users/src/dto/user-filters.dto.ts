import type { UserRole, UserStatus } from '@generated/prisma';

export type UserFiltersDto = {
    hub_id?: string;
    role?: UserRole;
    status?: UserStatus;
};
