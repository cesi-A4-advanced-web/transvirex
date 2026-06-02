import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
    const app = await NestFactory.create(GatewayModule);
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT || 3000);
    console.log('Gateway service is running on port 3000');
}
bootstrap().catch((error) => {
    console.error('Error starting gateway service:', error);
    process.exit(1);
});