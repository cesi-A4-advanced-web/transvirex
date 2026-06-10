import type { UserRole, UserStatus } from '@generated/prisma';

export type CreateUserDto = {
    reference?: string;
    hub_id?: string;
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
