import { Module } from '@nestjs/common';
import { AssistantAiController } from './assistant-ai.controller';
import { AssistantAiService } from './assistant-ai.service';

@Module({
  controllers: [AssistantAiController],
  providers: [AssistantAiService],
})
export class AssistantAiModule {}
