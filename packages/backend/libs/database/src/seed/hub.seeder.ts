import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextHubRef } from './helpers';

/** Seed a given number of random hubs. */
export async function seedHubs(prisma: PrismaClient, count: number, addressIds: string[]) {
    const hubs: { id: string; address_id: string | null }[] = [];

    for (let i = 0; i < count; i++) {
        const hub = await prisma.hub.create({
            data: {
                reference: nextHubRef(),
                name: faker.company.name() + ' Hub',
                phone_number: faker.phone.number(),
                capacity_parcels_day: faker.number.int({ min: 100, max: 2000 }),
                status: 'active',
                address_id: faker.helpers.arrayElement(addressIds),
            },
        });
        hubs.push({ id: hub.id, address_id: hub.address_id });
    }

    return hubs;
}
