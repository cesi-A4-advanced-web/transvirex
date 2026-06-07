import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const existing = await prisma.user.findFirst();
    if (existing) {
        console.log('DB already seeded, skipping.');
        return;
    }

    const address = await prisma.address.create({
        data: {
            address: '1 Rue de la Logistique',
            street: 'Rue de la Logistique',
            city: 'Paris',
            postal_code: '75001',
        },
    });

    const hub = await prisma.hub.create({
        data: {
            reference: 'HUB-001',
            name: 'Hub Paris Centre',
            phone_number: '0123456789',
            capacity_parcels_day: 500,
            status: 'active',
            address_id: address.id,
        },
    });

    // mdp: Admin123!
    const adminHash = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
        data: {
            reference: 'USR-001',
            firstname: 'Admin',
            lastname: 'Transvirex',
            email: 'admin@transvirex.fr',
            hash_password: adminHash, // Admin123!
            role: 'admin',
            status: 'active',
            hub_id: hub.id,
        },
    });

    // mdp: Dispatcher123!
    const dispatcherHash = await bcrypt.hash('Dispatcher123!', 10);
    await prisma.user.create({
        data: {
            reference: 'USR-002',
            firstname: 'Jean',
            lastname: 'Dupont',
            email: 'dispatcher@transvirex.fr',
            hash_password: dispatcherHash, // Dispatcher123!
            role: 'dispatcher',
            status: 'active',
            hub_id: hub.id,
        },
    });

    // mdp: Driver123!
    const driverHash = await bcrypt.hash('Driver123!', 10);
    const driverUser = await prisma.user.create({
        data: {
            reference: 'USR-003',
            firstname: 'Pierre',
            lastname: 'Martin',
            email: 'driver@transvirex.fr',
            hash_password: driverHash, // Driver123!
            role: 'driver',
            status: 'active',
            hub_id: hub.id,
        },
    });

    await prisma.driver.create({
        data: {
            reference: 'DRV-001',
            user_id: driverUser.id,
            rating: 4.8,
        },
    });

    console.log('DB seeded successfully.');
    console.log('  admin@transvirex.fr       / Admin123!');
    console.log('  dispatcher@transvirex.fr  / Dispatcher123!');
    console.log('  driver@transvirex.fr      / Driver123!');
}

main().finally(() => prisma.$disconnect());
