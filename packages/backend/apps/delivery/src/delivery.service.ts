import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class DeliveryService {
    constructor(private readonly prisma: PrismaService) {}

    async listHubs() {
        return this.prisma.hub.findMany({
            include: {
                address: true,
                _count: { select: { users: true, vehicles: true, customers: true, invoices: true } },
            },
            orderBy: { reference: 'asc' },
        });
    }

    async getHub(id: string) {
        const hub = await this.prisma.hub.findUnique({
            where: { id },
            include: {
                address: true,
                _count: { select: { users: true, vehicles: true, customers: true, invoices: true } },
            },
        });
        if (!hub) throw new NotFoundException('Hub non trouvé');
        return hub;
    }

    async createHub(data: {
        reference: string;
        name?: string;
        phone_number?: string;
        manager_id?: string;
        address_id?: string;
        capacity_parcels_day?: number;
        status?: string;
    }) {
        return this.prisma.hub.create({
            data: {
                reference: data.reference,
                name: data.name ?? null,
                phone_number: data.phone_number ?? null,
                manager_id: data.manager_id ?? null,
                address_id: data.address_id ?? null,
                capacity_parcels_day: data.capacity_parcels_day ?? null,
                status: (data.status ?? 'active') as any,
            },
            include: {
                address: true,
                _count: { select: { users: true, vehicles: true, customers: true, invoices: true } },
            },
        });
    }

    async updateHub(
        id: string,
        data: {
            name?: string;
            phone_number?: string;
            manager_id?: string;
            address_id?: string;
            capacity_parcels_day?: number;
            status?: string;
        },
    ) {
        const existing = await this.prisma.hub.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Hub non trouvé');

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
        if (data.manager_id !== undefined) updateData.manager_id = data.manager_id;
        if (data.address_id !== undefined) updateData.address_id = data.address_id;
        if (data.capacity_parcels_day !== undefined) updateData.capacity_parcels_day = data.capacity_parcels_day;
        if (data.status !== undefined) updateData.status = data.status;

        return this.prisma.hub.update({
            where: { id },
            data: updateData,
            include: {
                address: true,
                _count: { select: { users: true, vehicles: true, customers: true, invoices: true } },
            },
        });
    }
}
