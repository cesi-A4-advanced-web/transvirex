import { PrismaService } from '@app/database';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class StockService {
    constructor(private readonly prisma: PrismaService) {}

    private async generateVehicleReference(): Promise<string> {
        const last = await this.prisma.vehicle.findFirst({
            orderBy: { reference: 'desc' },
            select: { reference: true },
        });
        let nextNum = 1;
        if (last) {
            const match = last.reference.match(/VEH-(\d+)/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        return `VEH-${String(nextNum).padStart(3, '0')}`;
    }

    async listVehicles(hub_id?: string) {
        return this.prisma.vehicle.findMany({
            where: hub_id ? { hub_id } : undefined,
            include: {
                hub: true,
                drivers: {
                    include: { user: true },
                },
            },
            orderBy: { reference: 'asc' },
        });
    }

    async createVehicle(dto: { hub_id?: string; type?: string; license_plate?: string }) {
        const reference = await this.generateVehicleReference();
        return this.prisma.vehicle.create({
            data: {
                reference,
                hub_id: dto.hub_id,
                type: dto.type,
                license_plate: dto.license_plate,
            },
            include: { hub: true },
        });
    }

    async updateVehicle(
        id: string,
        dto: { hub_id?: string; type?: string; license_plate?: string; driver_id?: string | null },
    ) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) throw new NotFoundException('Véhicule introuvable');

        if (dto.driver_id !== undefined) {
            if (dto.driver_id === null) {
                await this.prisma.driver.updateMany({
                    where: { vehicle_id: id },
                    data: { vehicle_id: null },
                });
            } else {
                const driver = await this.prisma.driver.findUnique({
                    where: { id: dto.driver_id },
                    include: { user: true },
                });
                if (!driver) throw new NotFoundException('Driver introuvable');
                if (driver.user.status !== 'active') throw new ConflictException('Le driver doit être actif');

                const activeDriver = await this.prisma.driver.findFirst({
                    where: { vehicle_id: id, user: { status: 'active' } },
                });
                if (activeDriver && activeDriver.id !== dto.driver_id) {
                    throw new ConflictException('Un autre driver actif est déjà assigné à ce véhicule');
                }

                await this.prisma.driver.update({
                    where: { id: dto.driver_id },
                    data: { vehicle_id: id },
                });
            }
        }

        return this.prisma.vehicle.update({
            where: { id },
            data: {
                ...(dto.hub_id !== undefined && { hub_id: dto.hub_id }),
                ...(dto.type !== undefined && { type: dto.type }),
                ...(dto.license_plate !== undefined && { license_plate: dto.license_plate }),
            },
            include: {
                hub: true,
                drivers: { include: { user: true } },
            },
        });
    }

    async deleteVehicle(id: string) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) throw new NotFoundException('Véhicule introuvable');

        await this.prisma.driver.updateMany({
            where: { vehicle_id: id },
            data: { vehicle_id: null },
        });

        await this.prisma.vehicle.delete({ where: { id } });
        return { success: true };
    }
}
