import { PrismaService } from '@app/database';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
    private readonly serviceUrls = {
        auth:
            process.env.AUTH_SERVICE_URL ||
            'http://authentication-service:3000',
        billing:
            process.env.BILLING_SERVICE_URL || 'http://billing-service:3000',
        delivery:
            process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3000',
        stock: process.env.STOCK_SERVICE_URL || 'http://stock-service:3000',
        users: process.env.USERS_SERVICE_URL || 'http://users-service:3000',
    };

    constructor(private readonly prisma: PrismaService) {}

    private async fetchHealth(service: string, baseUrl: string) {
        try {
            const response = await fetch(`${baseUrl}/health`, {
                signal: AbortSignal.timeout(5000),
            });
            return await response.json();
        } catch {
            throw new HttpException(
                { status: 'error', service, message: 'Service unreachable' },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    getHello(): string {
        return 'Hello World!';
    }

    getGatewayHealth() {
        return { status: 'ok' };
    }

    getAuthHealth() {
        return this.fetchHealth('auth', this.serviceUrls.auth);
    }

    getBillingHealth() {
        return this.fetchHealth('billing', this.serviceUrls.billing);
    }

    getStockHealth() {
        return this.fetchHealth('stock', this.serviceUrls.stock);
    }

    getDeliveryHealth() {
        return this.fetchHealth('delivery', this.serviceUrls.delivery);
    }

    getUsersHealth() {
        return this.fetchHealth('users', this.serviceUrls.users);
    }

    async executePostgreSQL(query: string) {
        const result = await this.prisma.$queryRawUnsafe(query);
        const rows = result as any[];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return { columns, rows, rowCount: rows.length };
    }
}
