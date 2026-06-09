import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextDriverRef } from './helpers';

/** Seed driver records for each provided user ID, assigning a random vehicle. */
export async function seedDrivers(
    prisma: PrismaClient,
    driverUserIds: string[],
    vehicles: { id: string }[],
) {
    const drivers: { id: string; user_id: string }[] = [];

    for (const userId of driverUserIds) {
        const driver = await prisma.driver.create({
            data: {
                reference: nextDriverRef(),
                user_id: userId,
                rating: faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
                vehicle_id: faker.helpers.arrayElement(vehicles).id,
            },
        });
        drivers.push({ id: driver.id, user_id: driver.user_id });
    }

    return drivers;
}
