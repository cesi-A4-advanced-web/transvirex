import { LoggingInterceptor, LoggingService } from '@app/logging';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { GatewayModule } from './gateway.module';

/** Bootstrap the API gateway with Swagger docs, cookie parsing, and global validation. */
async function bootstrap() {
    const app = await NestFactory.create(GatewayModule, { bufferLogs: true });

    const logger = app.get(LoggingService);
    logger.setServiceName('gateway');
    app.useLogger(logger);
    app.useGlobalInterceptors(app.get(LoggingInterceptor));

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');

    if (process.env.NODE_ENV !== 'production') {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Transvirex ERP - Gateway API')
            .setDescription(
                'API Gateway for Transvirex ERP microservices. ' +
                    'Provides authentication, billing (invoices), deliveries, users, hubs, ' +
                    'health checks, debugging tools, and log ingestion.',
            )
            .setVersion('1.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT access token (set via cookie "access_token" on login)',
                },
                'JWT-auth',
            )
            .build();

        const options: SwaggerDocumentOptions = {
            operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
        };

        const document = SwaggerModule.createDocument(app, swaggerConfig, options);
        SwaggerModule.setup('api/docs', app, document);
        logger.log('Swagger documentation available at /api/docs', 'Bootstrap');
    }

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.log(`Gateway service is running on port ${PORT}`, 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('Error starting gateway service:', error);
    process.exit(1);
});
