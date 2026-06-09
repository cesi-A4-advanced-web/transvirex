import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';

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
}
