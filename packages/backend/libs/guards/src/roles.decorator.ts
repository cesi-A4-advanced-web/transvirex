import { SetMetadata } from '@nestjs/common';

/** Possible user roles in the system. */
export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'business_manager';

/** Metadata key used to store required roles on a route. */
export const ROLES_KEY = 'roles';

/** Decorator that specifies which roles are allowed to access a route. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
