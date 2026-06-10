import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names using clsx and tailwind-merge.
 * Resolves Tailwind CSS class conflicts automatically.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Whether the app is running in production mode. */
export const isProduction = process.env.NODE_ENV === 'production';
/** Whether the app is running in development mode. */
export const isDevelopment = process.env.NODE_ENV === 'development';
/** Whether the app is running in staging mode. */
export const isStaging = process.env.NODE_ENV === 'staging';
