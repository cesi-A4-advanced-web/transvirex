import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

/** Service handling billing-related business logic. */
@Injectable()
export class BillingService {
    constructor(private readonly prisma: PrismaService) {}
}
