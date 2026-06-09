import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextVehicleRef } from './helpers';

export async function seedVehicles(
    prisma: PrismaClient,
    count: number,
    hubIds: string[],
) {
    const vehicles: { id: string; hub_id: string | null }[] = [];
    const types = ['van', 'truck', 'refrigerated', 'flatbed', 'box'];

    for (let i = 0; i < count; i++) {
        const vehicle = await prisma.vehicle.create({
            data: {
                reference: nextVehicleRef(),
                type: faker.helpers.arrayElement(types),
                license_plate: faker.vehicle.vrm(),
                hub_id: faker.helpers.arrayElement(hubIds),
            },
        });
        vehicles.push({ id: vehicle.id, hub_id: vehicle.hub_id });
    }

    return vehicles;
}
