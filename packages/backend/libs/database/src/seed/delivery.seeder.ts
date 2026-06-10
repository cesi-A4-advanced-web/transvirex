import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextDeliveryRef } from './helpers';

/** Seed a given number of random deliveries linked to invoices and drivers. */
export async function seedDeliveries(
    prisma: PrismaClient,
    count: number,
    invoices: { id: string }[],
    drivers: { id: string }[],
) {
    const deliveries: { id: string; invoice_id: string }[] = [];

    for (let i = 0; i < count; i++) {
        const invoice = faker.helpers.arrayElement(invoices);
        const status = faker.helpers.arrayElement([
            'delivered',
            'planned',
            'delivering',
            'cancelled',
            'blocked',
            'delayed',
        ]);

        const hasPosition = faker.datatype.boolean(0.3);
        const delivery = await prisma.delivery.create({
            data: {
                reference: nextDeliveryRef(),
                invoices_id: invoice.id,
                driver_id: faker.helpers.arrayElement(drivers).id,
                status,
                notes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : undefined,
                ...(hasPosition
                    ? {
                          position_history: JSON.stringify([
                              {
                                  lat: faker.location.latitude(),
                                  lng: faker.location.longitude(),
                                  ts: faker.date.recent().toISOString(),
                              },
                              {
                                  lat: faker.location.latitude(),
                                  lng: faker.location.longitude(),
                                  ts: faker.date.recent().toISOString(),
                              },
                          ]),
                      }
                    : {}),
            },
        });
        deliveries.push({ id: delivery.id, invoice_id: delivery.invoices_id });
    }

    return deliveries;
}
