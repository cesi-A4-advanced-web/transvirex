import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import type { Prisma } from '@generated/prisma';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { DeliveryFiltersDto, DeliveryRequestUser } from './dto/delivery-filters.dto';
import type { UpdateDeliveryDto } from './dto/update-delivery.dto';

const deliveryInclude = {
    invoice: true,
    driver: {
        include: {
            user: {
                select: {
                    id: true,
                    reference: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                },
            },
            vehicle: true,
        },
    },
} as const;

const deliveryDetailInclude = {
    ...deliveryInclude,
    delivery_events: { orderBy: { created_at: 'asc' as const } },
} as const;

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

    private async resolveDriverId(user?: DeliveryRequestUser): Promise<string | undefined> {
        if (user?.role !== 'driver' || !user.id) return undefined;
        const driver = await this.prisma.driver.findUnique({
            where: { user_id: user.id },
            select: { id: true },
        });
        return driver?.id;
    }

    private buildDeliveryWhere(
        filters?: DeliveryFiltersDto,
        driverId?: string,
    ): Prisma.DeliveryWhereInput {
        const where: Prisma.DeliveryWhereInput = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.driver_id) where.driver_id = filters.driver_id;
        if (driverId) where.driver_id = driverId;

        const invoiceWhere: Prisma.InvoiceWhereInput = {};
        if (filters?.hub_id) invoiceWhere.hub_id = filters.hub_id;
        if (filters?.date_from || filters?.date_to) {
            invoiceWhere.due_date = {};
            if (filters.date_from) {
                invoiceWhere.due_date.gte = new Date(filters.date_from);
            }
            if (filters.date_to) {
                invoiceWhere.due_date.lte = new Date(filters.date_to);
            }
        }
        if (Object.keys(invoiceWhere).length > 0) {
            where.invoice = invoiceWhere;
        }

        return where;
    }

    private async assertDriverAccess(
        delivery: { driver_id: string | null },
        user?: DeliveryRequestUser,
    ) {
        if (user?.role !== 'driver' || !user.id) return;
        const driverId = await this.resolveDriverId(user);
        if (!driverId || delivery.driver_id !== driverId) {
            throw new ForbiddenException('Access denied');
        }
    }

    async findAllDeliveries(
        page: number,
        limit: number,
        filters?: DeliveryFiltersDto,
        user?: DeliveryRequestUser,
    ) {
        const driverId = await this.resolveDriverId(user);
        if (user?.role === 'driver' && !driverId) {
            return { data: [], page, limit, total: 0 };
        }

        const where = this.buildDeliveryWhere(filters, driverId);
        const [data, total] = await Promise.all([
            this.prisma.delivery.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: deliveryInclude,
                orderBy: { reference: 'asc' },
            }),
            this.prisma.delivery.count({ where }),
        ]);

        return { data, page, limit, total };
    }

    async findDeliveryById(id: string, user?: DeliveryRequestUser) {
        const delivery = await this.prisma.delivery.findUnique({
            where: { id },
            include: deliveryDetailInclude,
        });
        if (!delivery) throw new NotFoundException(`Delivery ${id} not found`);
        await this.assertDriverAccess(delivery, user);
        return delivery;
    }

    async createDelivery(dto: CreateDeliveryDto) {
        return this.prisma.delivery.create({
            data: {
                invoices_id: dto.invoices_id,
                reference: dto.reference,
                driver_id: dto.driver_id ?? null,
                status: dto.status,
                notes: dto.notes,
                position_history: dto.position_history ?? undefined,
            },
            include: deliveryInclude,
        });
    }

    async updateDelivery(id: string, dto: UpdateDeliveryDto) {
        const existing = await this.prisma.delivery.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Delivery ${id} not found`);

        const updateData: Record<string, unknown> = {};
        if (dto.invoices_id !== undefined) updateData.invoices_id = dto.invoices_id;
        if (dto.reference !== undefined) updateData.reference = dto.reference;
        if (dto.driver_id !== undefined) updateData.driver_id = dto.driver_id;
        if (dto.status !== undefined) updateData.status = dto.status;
        if (dto.notes !== undefined) updateData.notes = dto.notes;
        if (dto.position_history !== undefined) {
            updateData.position_history = dto.position_history;
        }

        return this.prisma.delivery.update({
            where: { id },
            data: updateData,
            include: deliveryInclude,
        });
    }

    async removeDelivery(id: string) {
        const existing = await this.prisma.delivery.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Delivery ${id} not found`);

        await this.prisma.deliveryEvent.deleteMany({ where: { delivery_id: id } });
        await this.prisma.delivery.delete({ where: { id } });
        return { success: true, id };
    }
}
