import { NestFactory } from '@nestjs/core';
import dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.BACKEND_PORT ?? 3000);
  const host = process.env.BACKEND_HOST ?? 'localhost';

  await app.listen(port, host);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
