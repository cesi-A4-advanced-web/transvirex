import { Injectable } from '@nestjs/common';
import { createMicroserviceStatus } from '../shared/microservice-status';

@Injectable()
export class ToursService {
  getStatus() {
    return createMicroserviceStatus(
      'tour-planning',
      'Base tour planning microservice',
    );
  }
}
