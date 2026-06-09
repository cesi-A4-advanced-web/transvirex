import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/** Root module for the users microservice. */
@Module({
    imports: [DatabaseModule, LoggingModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule {}
