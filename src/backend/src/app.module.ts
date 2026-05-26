import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantAiModule } from './microservices/assistant-ai/assistant-ai.module';
import { AuthenticationModule } from './microservices/authentication/authentication.module';
import { BillingModule } from './microservices/billing/billing.module';
import { StockModule } from './microservices/stock/stock.module';
import { ToursModule } from './microservices/tours/tours.module';
import { UsersModule } from './microservices/users/users.module';

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    ToursModule,
    BillingModule,
    StockModule,
    AssistantAiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
