import { PrismaClient } from '@generated/prisma';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

/** PostgreSQL connection credentials (from environment or defaults). */
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres';
const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
const POSTGRES_DB = process.env.POSTGRES_DB || 'transvirex';

/** Service wrapping the Prisma ORM client with lifecycle hooks for PostgreSQL. */
@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        const URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
        const adapter = new PrismaPg(URL);
        super({ adapter });
    }

    /** Connect to the database when the module initializes. */
    async onModuleInit() {
        await this.$connect();
    }

    /** Disconnect from the database when the module is destroyed. */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}
