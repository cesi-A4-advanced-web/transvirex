import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';

/** Service handling billing-related business logic. */
@Injectable()
export class BillingService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Find an invoice by its ID
     * @param id - The ID of the invoice
     * @returns The invoice
     * @throws NotFoundException if the invoice is not found
     */
    async findById(id: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
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
            },
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice ${id} not found`);
        }

        return invoice;
    }

    /**
     * Find all invoices with pagination
     * @param page - The page number (1-based)
     * @param limit - The number of invoices per page
     */
    async findAll(page: number, limit: number) {
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.invoice.count(),
        ]);

        return {
            data,
            page,
            limit,
            total,
        };
    }

    /** Create a new invoice */
    async create(dto: CreateInvoiceDto) {
        return this.prisma.invoice.create({
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
                amount: dto.amount ?? 0,
                status: dto.status,
            },
            include: {
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
            },
        });
    }
}
