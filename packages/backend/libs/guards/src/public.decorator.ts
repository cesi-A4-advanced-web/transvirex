import { SetMetadata } from '@nestjs/common';

/** Metadata key used to mark a route as publicly accessible. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Decorator that marks a route handler as publicly accessible (no JWT required). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
