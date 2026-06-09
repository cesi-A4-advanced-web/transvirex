import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

/** Service handling delivery-related business logic. */
@Injectable()
export class DeliveryService {
    constructor(private readonly prisma: PrismaService) {}
}
