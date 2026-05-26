import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { MICROSERVICE_BASES } from './../src/microservices/shared/microservice-status';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        application: 'backend',
        status: 'ok',
        microservices: [...MICROSERVICE_BASES],
      });
  });

  it.each([
    ['/authentication', 'authentication', 'Base authentication microservice'],
    ['/users', 'user-management', 'Base user management microservice'],
    ['/tours', 'tour-planning', 'Base tour planning microservice'],
    ['/billing', 'billing', 'Base billing microservice'],
    ['/stock', 'stock-management', 'Base stock management microservice'],
    ['/assistant-ai', 'assistant-ai', 'Base AI assistant microservice'],
  ])('GET %s returns the microservice status', (path, name, description) => {
    return request(app.getHttpServer()).get(path).expect(200).expect({
      name,
      description,
      status: 'ok',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
