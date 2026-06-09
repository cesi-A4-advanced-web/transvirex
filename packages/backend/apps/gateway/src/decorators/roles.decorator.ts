import { SetMetadata } from '@nestjs/common';

export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'business_manager';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
