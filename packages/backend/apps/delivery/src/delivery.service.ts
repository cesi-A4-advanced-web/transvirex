import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';

/** Delivery statuses considered "in progress" for a driver's current tour. */
const ACTIVE_DELIVERY_STATUSES = ['planned', 'delivering', 'delayed', 'blocked'] as const;

@Injectable()
export class DeliveryService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * List the active deliveries of a driver, identified by their **User id**
     * (the JWT `sub`). Resolves User -> Driver -> deliveries.
     */
    async listDriverDeliveries(userId: string) {
        const driver = await this.prisma.driver.findUnique({ where: { user_id: userId } });
        if (!driver) return { deliveries: [] };

        const deliveries = await this.prisma.delivery.findMany({
            where: {
                driver_id: driver.id,
                status: { in: ACTIVE_DELIVERY_STATUSES as unknown as any },
            },
            include: {
                invoice: {
                    include: {
                        customer: { select: { customer_name: true } },
                        delivery_address: { select: { address: true, city: true, postal_code: true } },
                    },
                },
            },
            orderBy: { reference: 'asc' },
        });

        return {
            deliveries: deliveries.map((d) => ({
                id: d.id,
                reference: d.reference,
                status: d.status,
                notes: d.notes,
                customer: d.invoice?.customer?.customer_name ?? null,
                address: d.invoice?.delivery_address
                    ? [
                          d.invoice.delivery_address.address,
                          d.invoice.delivery_address.postal_code,
                          d.invoice.delivery_address.city,
                      ]
                          .filter(Boolean)
                          .join(', ')
                    : null,
            })),
        };
    }

    /** Create a DeliveryEvent (incident, status update, note...) on a delivery. */
    async createDeliveryEvent(
        deliveryId: string,
        data: {
            description?: string;
            type?: string;
            status?: string;
            latitude?: number;
            longitude?: number;
        },
    ) {
        const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
        if (!delivery) throw new NotFoundException('Livraison non trouvée');

        const eventType = (data.type ?? 'note') as any;
        const eventStatus = (data.status ?? 'information') as any;
        if (!data.description) throw new BadRequestException('description requise');

        return this.prisma.deliveryEvent.create({
            data: {
                delivery_id: deliveryId,
                description: data.description,
                type: eventType,
                status: eventStatus,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                created_at: new Date(),
            },
        });
    }

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
