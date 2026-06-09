import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { seedAddresses } from './address.seeder';
import { seedCustomers } from './customer.seeder';
import { seedDeliveryEvents } from './delivery-event.seeder';
import { seedDeliveries } from './delivery.seeder';
import { seedDrivers } from './driver.seeder';
import { resetCounters } from './helpers';
import { seedHubs } from './hub.seeder';
import { seedInvoices } from './invoice.seeder';
import { seedParcels } from './parcel.seeder';
import { seedUsers } from './user.seeder';
import { seedVehicles } from './vehicle.seeder';

export interface SeedResult {
    addresses: number;
    hubs: number;
    users: number;
    vehicles: number;
    drivers: number;
    customers: number;
    invoices: number;
    deliveries: number;
}

export async function seedDatabase(
    prisma: PrismaClient,
    force: boolean = false,
): Promise<SeedResult> {
    const existing = await prisma.user.findFirst();
    if (existing) {
        if (force) {
            await prisma.deliveryEvent.deleteMany();
            await prisma.parcel.deleteMany();
            await prisma.delivery.deleteMany();
            await prisma.invoice.deleteMany();
            await prisma.customer.deleteMany();
            await prisma.driver.deleteMany();
            await prisma.vehicle.deleteMany();
            await prisma.user.deleteMany();
            await prisma.hub.deleteMany();
            await prisma.address.deleteMany();
        } else throw new Error('Database already seeded');
    }

    faker.seed(42);
    resetCounters();

    const addressIds = await seedAddresses(prisma, 15);
    const hubs = await seedHubs(prisma, 5, addressIds);
    const hubIds = hubs.map((h) => h.id);
    const users = await seedUsers(prisma, hubIds, 7);
    const vehicles = await seedVehicles(prisma, 8, hubIds);
    const driverUserIds = users
        .filter((u) => u.role === 'driver')
        .map((u) => u.id);
    const drivers = await seedDrivers(prisma, driverUserIds, vehicles);
    const customers = await seedCustomers(prisma, 10, hubIds, addressIds);
    const businessManagerUsers = users.filter(
        (u) => u.role === 'business_manager',
    );
    const invoices = await seedInvoices(
        prisma,
        20,
        customers,
        hubs,
        addressIds,
        businessManagerUsers,
    );
    const deliveries = await seedDeliveries(prisma, 20, invoices, drivers);
    await seedParcels(prisma, 2, invoices);
    await seedDeliveryEvents(prisma, deliveries, 1, 3);

    return {
        addresses: addressIds.length,
        hubs: hubs.length,
        users: users.length,
        vehicles: vehicles.length,
        drivers: drivers.length,
        customers: customers.length,
        invoices: invoices.length,
        deliveries: deliveries.length,
    };
}
