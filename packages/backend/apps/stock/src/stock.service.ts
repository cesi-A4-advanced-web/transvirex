import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

/** Service handling stock-related business logic. */
@Injectable()
export class StockService {
    constructor(private readonly prisma: PrismaService) {}
}
