import { AppService } from './app.service';
import { MICROSERVICE_BASES } from './microservices/shared/microservice-status';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
  });

  it('should expose the backend status payload', () => {
    expect(appService.getStatus()).toEqual({
      application: 'backend',
      status: 'ok',
      microservices: [...MICROSERVICE_BASES],
    });
  });
});
