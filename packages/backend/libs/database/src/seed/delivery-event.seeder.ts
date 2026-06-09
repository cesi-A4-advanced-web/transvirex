import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';

/** Seed random delivery events for each delivery. */
export async function seedDeliveryEvents(
    prisma: PrismaClient,
    deliveries: { id: string }[],
    eventsPerDeliveryMin: number,
    eventsPerDeliveryMax: number,
) {
    const statuses: ('waiting' | 'resolved' | 'information')[] = ['waiting', 'resolved', 'information'];
    const types: ('note' | 'info' | 'warning' | 'critical' | 'fatal')[] = ['note', 'info', 'warning', 'critical', 'fatal'];

    for (const delivery of deliveries) {
        const count = faker.number.int({ min: eventsPerDeliveryMin, max: eventsPerDeliveryMax });

        for (let i = 0; i < count; i++) {
            const type = faker.helpers.arrayElement(types);
            const status: 'waiting' | 'resolved' | 'information' = type === 'fatal' || type === 'critical'
                ? 'waiting'
                : faker.helpers.arrayElement(statuses);

            await prisma.deliveryEvent.create({
                data: {
                    delivery_id: delivery.id,
                    description: faker.lorem.sentence(),
                    latitude: faker.location.latitude(),
                    longitude: faker.location.longitude(),
                    type,
                    status,
                    resolution_description: status === 'resolved' ? faker.lorem.sentence() : null,
                    created_at: faker.date.recent(),
                    resolution_date: status === 'resolved' ? faker.date.recent() : null,
                },
            });
        }
    }
}
