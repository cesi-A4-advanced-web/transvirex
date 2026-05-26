import { Controller, Get } from '@nestjs/common';
import { AssistantAiService } from './assistant-ai.service';

@Controller('assistant-ai')
export class AssistantAiController {
  constructor(private readonly assistantAiService: AssistantAiService) {}

  @Get()
  getStatus() {
    return this.assistantAiService.getStatus();
  }
}
