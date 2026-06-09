import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Global module providing the PrismaService throughout the application. */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class DatabaseModule {}
