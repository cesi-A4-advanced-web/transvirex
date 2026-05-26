import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MICROSERVICE_BASES } from './microservices/shared/microservice-status';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the backend status payload', () => {
      expect(appController.getStatus()).toEqual({
        application: 'backend',
        status: 'ok',
        microservices: [...MICROSERVICE_BASES],
      });
    });
  });
});
