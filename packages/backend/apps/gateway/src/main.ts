import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);

    app.setGlobalPrefix('api');
    await app.listen(
        process.env.API_PORT || 3000,
        process.env.API_HOST || '0.0.0.0',
    );
}
bootstrap().catch((error) => {
    console.error('Error starting the Gateway application:', error);
    process.exit(1);
});
