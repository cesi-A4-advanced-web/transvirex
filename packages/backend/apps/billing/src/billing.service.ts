import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import type { InvoiceStatus, Prisma } from '@generated/prisma';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import type { UpdateInvoiceDto } from './dto/update-invoice.dto';
import type { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

const invoiceInclude = {
    customer: true,
    hub: true,
    business_manager: {
        select: {
            id: true,
            reference: true,
            firstname: true,
            lastname: true,
            email: true,
        },
    },
} as const;

const invoiceDetailInclude = {
    ...invoiceInclude,
    parcels: true,
    deliveries: {
        include: {
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
                },
            },
        },
    },
} as const;

const STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus | null> = {
    quotation: 'purchase_order',
    purchase_order: 'invoice',
    invoice: null,
};

/** Service handling billing-related business logic. */
@Injectable()
export class BillingService {
    constructor(private readonly prisma: PrismaService) {}

    private getPricePerKg(): number {
        return Number(process.env.INVOICE_PRICE_PER_KG ?? 10);
    }

    private async calculateAmountFromParcels(invoiceId: string): Promise<number> {
        const parcels = await this.prisma.parcel.findMany({
            where: { invoice_id: invoiceId },
            select: { weight: true },
        });
        const rate = this.getPricePerKg();
        return parcels.reduce((sum, parcel) => sum + parcel.weight * rate, 0);
    }

    private buildInvoiceWhere(filters?: InvoiceFiltersDto): Prisma.InvoiceWhereInput {
        const where: Prisma.InvoiceWhereInput = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.customer_id) where.customer_id = filters.customer_id;
        if (filters?.hub_id) where.hub_id = filters.hub_id;
        if (filters?.due_date_from || filters?.due_date_to) {
            where.due_date = {};
            if (filters.due_date_from) {
                where.due_date.gte = new Date(filters.due_date_from);
            }
            if (filters.due_date_to) {
                where.due_date.lte = new Date(filters.due_date_to);
            }
        }
        return where;
    }

    /**
     * Find an invoice by its ID with parcels and deliveries.
     */
    async findById(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: invoiceDetailInclude,
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice ${id} not found`);
        }

        const amount = await this.calculateAmountFromParcels(id);
        if (amount !== invoice.amount) {
            return this.prisma.invoice.update({
                where: { id },
                data: { amount },
                include: invoiceDetailInclude,
            });
        }

        return invoice;
    }

    /** Find all invoices with pagination and optional filters. */
    async findAll(page: number, limit: number, filters?: InvoiceFiltersDto) {
        const where = this.buildInvoiceWhere(filters);
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: invoiceInclude,
                orderBy: { reference: 'asc' },
            }),
            this.prisma.invoice.count({ where }),
        ]);

        return { data, page, limit, total };
    }

    /** Create a new invoice (defaults to quotation status). */
    async create(dto: CreateInvoiceDto) {
        const invoice = await this.prisma.invoice.create({
            data: {
                customer_id: dto.customer_id,
                hub_id: dto.hub_id,
                pickup_address_id: dto.pickup_address_id,
                delivery_address_id: dto.delivery_address_id,
                business_manager_id: dto.business_manager_id,
                reference: dto.reference,
                priority: dto.priority,
                due_date: new Date(dto.due_date),
                service_type: dto.service_type,
                payment_date: dto.payment_date
                    ? new Date(dto.payment_date)
                    : null,
                amount: 0,
                status: 'quotation',
            },
            include: invoiceInclude,
        });

        const amount = await this.calculateAmountFromParcels(invoice.id);
        if (amount > 0) {
            return this.prisma.invoice.update({
                where: { id: invoice.id },
                data: { amount },
                include: invoiceInclude,
            });
        }

        return invoice;
    }

    /** Update an invoice (status changes use transitionStatus). */
    async update(id: string, dto: UpdateInvoiceDto) {
        const existing = await this.prisma.invoice.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Invoice ${id} not found`);
        }

        const updateData: Record<string, unknown> = {};
        if (dto.customer_id !== undefined) updateData.customer_id = dto.customer_id;
        if (dto.hub_id !== undefined) updateData.hub_id = dto.hub_id;
        if (dto.pickup_address_id !== undefined) {
            updateData.pickup_address_id = dto.pickup_address_id;
        }
        if (dto.delivery_address_id !== undefined) {
            updateData.delivery_address_id = dto.delivery_address_id;
        }
        if (dto.business_manager_id !== undefined) {
            updateData.business_manager_id = dto.business_manager_id;
        }
        if (dto.reference !== undefined) updateData.reference = dto.reference;
        if (dto.priority !== undefined) updateData.priority = dto.priority;
        if (dto.due_date !== undefined) updateData.due_date = new Date(dto.due_date);
        if (dto.service_type !== undefined) updateData.service_type = dto.service_type;
        if (dto.payment_date !== undefined) {
            updateData.payment_date = dto.payment_date
                ? new Date(dto.payment_date)
                : null;
        }

        await this.prisma.invoice.update({
            where: { id },
            data: updateData,
        });

        const amount = await this.calculateAmountFromParcels(id);
        return this.prisma.invoice.update({
            where: { id },
            data: { amount },
            include: invoiceInclude,
        });
    }

    /** Transition invoice status (quotation → purchase_order → invoice). */
    async transitionStatus(id: string, dto: UpdateInvoiceStatusDto) {
        const existing = await this.prisma.invoice.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Invoice ${id} not found`);
        }

        const currentStatus = existing.status ?? 'quotation';
        const allowedNext = STATUS_TRANSITIONS[currentStatus];
        if (!allowedNext || allowedNext !== dto.status) {
            throw new BadRequestException(
                `Invalid status transition from ${currentStatus} to ${dto.status}`,
            );
        }

        const amount = await this.calculateAmountFromParcels(id);
        return this.prisma.invoice.update({
            where: { id },
            data: { status: dto.status, amount },
            include: invoiceInclude,
        });
    }

    /** Delete an invoice and related data. */
    async remove(id: string) {
        const existing = await this.prisma.invoice.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`Invoice ${id} not found`);
        }

        const deliveries = await this.prisma.delivery.findMany({
            where: { invoices_id: id },
            select: { id: true },
        });
        const deliveryIds = deliveries.map((d) => d.id);
        if (deliveryIds.length > 0) {
            await this.prisma.deliveryEvent.deleteMany({
                where: { delivery_id: { in: deliveryIds } },
            });
            await this.prisma.delivery.deleteMany({ where: { invoices_id: id } });
        }
        await this.prisma.parcel.deleteMany({ where: { invoice_id: id } });
        await this.prisma.invoice.delete({ where: { id } });
        return { success: true, id };
    }
}
