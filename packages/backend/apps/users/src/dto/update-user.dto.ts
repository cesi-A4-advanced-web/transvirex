import type { UserRole, UserStatus } from '@generated/prisma';

export type UpdateUserDto = {
    hub_id?: string | null;
    firstname?: string;
    lastname?: string;
    phone_number?: string;
    work_phone_number?: string;
    email?: string;
    work_email?: string;
    password?: string;
    status?: UserStatus;
    role?: UserRole;
};
