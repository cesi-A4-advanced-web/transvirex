import { Global, Module } from '@nestjs/common';
import { MongoDBModule } from '@app/mongodb';
import { LoggingService } from './logging.service';
import { LoggingInterceptor } from './logging.interceptor';

/** Global module providing centralized logging to MongoDB. */
@Global()
@Module({
    imports: [MongoDBModule],
    providers: [LoggingService, LoggingInterceptor],
    exports: [LoggingService, LoggingInterceptor],
})
export class LoggingModule {}
