import { Injectable } from '@nestjs/common';
import { createMicroserviceStatus } from '../shared/microservice-status';

@Injectable()
export class AuthenticationService {
  getStatus() {
    return createMicroserviceStatus(
      'authentication',
      'Base authentication microservice',
    );
  }
}
