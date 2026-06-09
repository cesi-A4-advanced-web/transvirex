import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextParcelRef } from './helpers';

/** Seed a given number of parcels per invoice. */
export async function seedParcels(
    prisma: PrismaClient,
    parcelsPerInvoice: number,
    invoices: { id: string }[],
) {
    for (const invoice of invoices) {
        for (let i = 0; i < parcelsPerInvoice; i++) {
            await prisma.parcel.create({
                data: {
                    reference: nextParcelRef(),
                    invoice_id: invoice.id,
                    weight: faker.number.float({ min: 0.5, max: 50, fractionDigits: 2 }),
                },
            });
        }
    }
}
