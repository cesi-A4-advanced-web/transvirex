import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@generated/prisma';
import { nextUserRef, hashPassword } from './helpers';

/** Shape of a static (hardcoded) user entry. */
interface StaticUser {
    firstname: string;
    lastname: string;
    email: string;
    role: 'admin' | 'dispatcher' | 'driver' | 'business_manager';
    password: string;
}

/** Predetermined users inserted on every seed. */
const STATIC_USERS: StaticUser[] = [
    { firstname: 'Admin', lastname: 'Transvirex', email: 'admin@transvirex.fr', role: 'admin', password: 'Admin123!' },
    { firstname: 'Jean', lastname: 'Dupont', email: 'dispatcher@transvirex.fr', role: 'dispatcher', password: 'Dispatcher123!' },
    { firstname: 'Pierre', lastname: 'Martin', email: 'driver@transvirex.fr', role: 'driver', password: 'Driver123!' },
];

/** Shape of a user seed result. */
interface UserResult {
    id: string;
    role: string;
    email: string | null;
}

/** Seed static users plus a given number of random additional users. */
export async function seedUsers(
    prisma: PrismaClient,
    hubIds: string[],
    extraCount: number,
) {
    const users: UserResult[] = [];

    for (const su of STATIC_USERS) {
        const user = await prisma.user.create({
            data: {
                reference: nextUserRef(),
                firstname: su.firstname,
                lastname: su.lastname,
                email: su.email,
                hash_password: await hashPassword(su.password),
                role: su.role,
                status: 'active',
                hub_id: faker.helpers.arrayElement(hubIds),
            },
        });
        users.push({ id: user.id, role: su.role, email: su.email });
    }

    const ROLES: ('dispatcher' | 'driver' | 'driver' | 'business_manager' | 'business_manager' | 'admin' | 'driver')[] = [
        'dispatcher', 'driver', 'driver', 'business_manager', 'business_manager', 'admin', 'driver',
    ];

    for (let i = 0; i < extraCount; i++) {
        const role = ROLES[i % ROLES.length];
        const firstname = faker.person.firstName();
        const lastname = faker.person.lastName();
        const email = faker.internet.email({ firstName: firstname, lastName: lastname }).toLowerCase();

        const user = await prisma.user.create({
            data: {
                reference: nextUserRef(),
                firstname,
                lastname,
                phone_number: faker.phone.number(),
                work_phone_number: faker.phone.number(),
                email,
                work_email: `work.${email}`,
                hash_password: await hashPassword('Password123!'),
                role,
                status: faker.helpers.arrayElement(['active', 'active', 'active', 'inactive']),
                hub_id: faker.helpers.arrayElement(hubIds),
            },
        });
        users.push({ id: user.id, role: user.role as string, email: user.email });
    }

    return users;
}
