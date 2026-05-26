import { Injectable } from '@nestjs/common';
import { createMicroserviceStatus } from '../shared/microservice-status';

@Injectable()
export class StockService {
  getStatus() {
    return createMicroserviceStatus(
      'stock-management',
      'Base stock management microservice',
    );
  }
}
