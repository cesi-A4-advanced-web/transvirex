import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';

export async function seedAddresses(prisma: PrismaClient, count: number) {
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
        const address = await prisma.address.create({
            data: {
                address: faker.location.streetAddress(),
                street: faker.location.street(),
                city: faker.location.city(),
                postal_code: faker.location.zipCode(),
            },
        });
        ids.push(address.id);
    }

    return ids;
}
