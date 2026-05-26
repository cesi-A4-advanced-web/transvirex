export const MICROSERVICE_BASES = [
  'authentication',
  'user-management',
  'tour-planning',
  'billing',
  'stock-management',
  'assistant-ai',
] as const;

export type MicroserviceBase = (typeof MICROSERVICE_BASES)[number];

export interface MicroserviceStatus {
  name: MicroserviceBase;
  description: string;
  status: 'ok';
}

export function createMicroserviceStatus(
  name: MicroserviceBase,
  description: string,
): MicroserviceStatus {
  return {
    name,
    description,
    status: 'ok',
  };
}
