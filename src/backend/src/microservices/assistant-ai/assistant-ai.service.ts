import { Injectable } from '@nestjs/common';
import { createMicroserviceStatus } from '../shared/microservice-status';

@Injectable()
export class AssistantAiService {
  getStatus() {
    return createMicroserviceStatus(
      'assistant-ai',
      'Base AI assistant microservice',
    );
  }
}
