import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);
    app.setGlobalPrefix('api');

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    console.log(`Gateway service is running on port ${PORT}`);
}
bootstrap().catch((error) => {
    console.error('Error starting gateway service:', error);
    process.exit(1);
});
