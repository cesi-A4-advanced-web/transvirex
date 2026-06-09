import { seedDatabase } from '@app/database/seed';
import { PrismaClient } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres';
const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
const POSTGRES_DB = process.env.POSTGRES_DB || 'transvirex';

const URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
const adapter = new PrismaPg(URL);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const result = await seedDatabase(prisma);
        console.log('DB seeded successfully.');
        console.log(`  ${result.addresses} addresses`);
        console.log(`  ${result.hubs} hubs`);
        console.log(`  ${result.users} users`);
        console.log(`  ${result.vehicles} vehicles`);
        console.log(`  ${result.drivers} drivers`);
        console.log(`  ${result.customers} customers`);
        console.log(`  ${result.invoices} invoices`);
        console.log(`  ${result.deliveries} deliveries`);
        console.log('');
        console.log('  admin@transvirex.fr       / Admin123!');
        console.log('  dispatcher@transvirex.fr  / Dispatcher123!');
        console.log('  driver@transvirex.fr      / Driver123!');
    } catch (e: any) {
        if ((e as Error).message === 'Database already seeded') {
            console.log('DB already seeded, skipping.');
        } else {
            throw e;
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(() => prisma.$disconnect());
