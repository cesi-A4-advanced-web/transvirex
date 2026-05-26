import { Injectable } from '@nestjs/common';
import { MICROSERVICE_BASES } from './microservices/shared/microservice-status';

@Injectable()
export class AppService {
  getStatus() {
    return {
      application: 'backend',
      status: 'ok' as const,
      microservices: [...MICROSERVICE_BASES],
    };
  }
}
