import { LoggingInterceptor, LoggingService } from '@app/logging';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule, { bufferLogs: true });

    const logger = app.get(LoggingService);
    logger.setServiceName('gateway');
    app.useLogger(logger);
    app.useGlobalInterceptors(app.get(LoggingInterceptor));

    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.setGlobalPrefix('api');

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.log(`Gateway service is running on port ${PORT}`, 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('Error starting gateway service:', error);
    process.exit(1);
});
