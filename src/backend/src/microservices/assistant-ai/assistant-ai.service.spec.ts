import { AssistantAiService } from './assistant-ai.service';

describe('AssistantAiService', () => {
  let assistantAiService: AssistantAiService;

  beforeEach(() => {
    assistantAiService = new AssistantAiService();
  });

  it('should expose the assistant base status', () => {
    expect(assistantAiService.getStatus()).toEqual({
      name: 'assistant-ai',
      description: 'Base AI assistant microservice',
      status: 'ok',
    });
  });
});
