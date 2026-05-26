import { Injectable } from '@nestjs/common';
import { createMicroserviceStatus } from '../shared/microservice-status';

@Injectable()
export class BillingService {
  getStatus() {
    return createMicroserviceStatus('billing', 'Base billing microservice');
  }
}
