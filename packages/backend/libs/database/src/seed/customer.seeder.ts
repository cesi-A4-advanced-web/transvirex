import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextCustomerRef } from './helpers';

/** Seed a given number of random customers linked to hubs and addresses. */
export async function seedCustomers(
    prisma: PrismaClient,
    count: number,
    hubIds: string[],
    addressIds: string[],
) {
    const customers: { id: string }[] = [];
    const types = ['individual', 'company', 'association'];

    for (let i = 0; i < count; i++) {
        const firstname = faker.person.firstName();
        const lastname = faker.person.lastName();

        const customer = await prisma.customer.create({
            data: {
                reference: nextCustomerRef(),
                customer_name: faker.company.name(),
                customer_type: faker.helpers.arrayElement(types),
                contact_firstname: firstname,
                contact_lastname: lastname,
                phone_number: faker.phone.number(),
                email: faker.internet.email({ firstName: firstname, lastName: lastname }).toLowerCase(),
                status: faker.helpers.arrayElement(['active', 'active', 'active', 'inactive']),
                hub_id: faker.helpers.arrayElement(hubIds),
                address_id: faker.helpers.arrayElement(addressIds),
            },
        });
        customers.push({ id: customer.id });
    }

    return customers;
}
