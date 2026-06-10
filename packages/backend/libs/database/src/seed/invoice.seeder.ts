import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextInvoiceRef } from './helpers';

/** Seed a given number of random invoices. */
export async function seedInvoices(
    prisma: PrismaClient,
    count: number,
    customers: { id: string }[],
    hubs: { id: string }[],
    addressIds: string[],
    businessManagerUsers: { id: string }[],
) {
    const invoices: { id: string }[] = [];

    for (let i = 0; i < count; i++) {
        const dueDate = faker.date.future();
        const isPaid = faker.datatype.boolean(0.3);

        const invoice = await prisma.invoice.create({
            data: {
                reference: nextInvoiceRef(),
                customer_id: faker.helpers.arrayElement(customers).id,
                hub_id: faker.helpers.arrayElement(hubs).id,
                pickup_address_id: faker.helpers.arrayElement(addressIds),
                delivery_address_id: faker.helpers.arrayElement(addressIds),
                business_manager_id: faker.helpers.arrayElement(businessManagerUsers).id,
                service_type: faker.helpers.arrayElement(['express', 'standard', 'freight']),
                priority: faker.helpers.arrayElement(['urgent', 'high', 'standard', 'low']),
                due_date: dueDate,
                payment_date: isPaid ? faker.date.past() : null,
                amount: faker.number.float({ min: 50, max: 5000, fractionDigits: 2 }),
                status: faker.helpers.arrayElement(['quotation', 'purchase_order', 'invoice']),
            },
        });
        invoices.push({ id: invoice.id });
    }

    return invoices;
}
