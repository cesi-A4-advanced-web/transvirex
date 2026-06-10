import { PrismaService } from '@app/database';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

/** Service handling user-related business logic. */
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Generate the next driver reference (DRV-XXX) based on the last existing reference.
     * @returns A new unique driver reference string.
     */
    private async generateDriverReference(): Promise<string> {
        const lastDriver = await this.prisma.driver.findFirst({
            orderBy: { reference: 'desc' },
            select: { reference: true },
        });
        let nextNum = 1;
        if (lastDriver) {
            const match = lastDriver.reference.match(/DRV-(\d+)/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        return `DRV-${String(nextNum).padStart(3, '0')}`;
    }

    /**
     * Create a Driver profile for a user.
     * @param userId The ID of the user to create the driver profile for.
     * @param dto An object containing optional vehicle_id and rating for the driver profile.
     * @returns The created Driver profile with related user and vehicle data.
     */
    async createDriver(userId: string, dto: { vehicle_id?: string; rating?: number }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Utilisateur introuvable');
        if (user.role !== 'driver') throw new BadRequestException("L'utilisateur doit avoir le rôle driver");

        const existing = await this.prisma.driver.findUnique({ where: { user_id: userId } });
        if (existing) throw new BadRequestException('Un profil Driver existe déjà pour cet utilisateur');

        const reference = await this.generateDriverReference();

        return this.prisma.driver.create({
            data: {
                reference,
                user_id: userId,
                vehicle_id: dto.vehicle_id,
                rating: dto.rating,
            },
            include: { user: true, vehicle: true },
        });
    }

    /**
     * Get the Driver profile for a user.
     * @param userId The ID of the user whose driver profile to retrieve.
     * @returns The Driver profile with related user, vehicle, and deliveries data.
     */
    async getDriver(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const driver = await this.prisma.driver.findUnique({
            where: { user_id: userId },
            include: { user: true, vehicle: true, deliveries: true },
        });
        if (!driver) throw new NotFoundException('Profil Driver introuvable');

        return driver;
    }
}
