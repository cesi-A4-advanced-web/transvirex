import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

/** Service handling user-related business logic. */
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}
}
