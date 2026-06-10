import { Global, Module } from '@nestjs/common';
import { MongoDBService } from './mongodb.service';

/** Global module providing the MongoDBService throughout the application. */
@Global()
@Module({
    providers: [MongoDBService],
    exports: [MongoDBService],
})
export class MongoDBModule {}
