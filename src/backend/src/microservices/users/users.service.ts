import { Injectable } from '@nestjs/common';
import { createMicroserviceStatus } from '../shared/microservice-status';

@Injectable()
export class UsersService {
  getStatus() {
    return createMicroserviceStatus(
      'user-management',
      'Base user management microservice',
    );
  }
}
