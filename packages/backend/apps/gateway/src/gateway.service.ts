import { PrismaService } from '@app/database';
import { seedDatabase as runSeed } from '@app/database/seed';
import { MongoDBService } from '@app/mongodb';
import { RabbitMQService } from '@app/rabbitmq';
import { RedisService } from '@app/redis';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
    private readonly serviceUrls = {
        auth:
            process.env.AUTH_SERVICE_URL ||
            'http://transvirex-authentication:3000',
        billing:
            process.env.BILLING_SERVICE_URL || 'http://transvirex-billing:3000',
        delivery:
            process.env.DELIVERY_SERVICE_URL ||
            'http://transvirex-delivery:3000',
        stock: process.env.STOCK_SERVICE_URL || 'http://transvirex-stock:3000',
        users: process.env.USERS_SERVICE_URL || 'http://transvirex-users:3000',
    };

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly rabbitMQService: RabbitMQService,
        private readonly mongoDBService: MongoDBService,
    ) {}

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

    private buildUserHeaders(user?: { sub: string; email: string; role: string }): Record<string, string> {
        if (!user) return {};
        return {
            'X-User-Id': user.sub,
            'X-User-Email': user.email ?? '',
            'X-User-Role': user.role ?? '',
        };
    }

    private async proxyPost(url: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.buildUserHeaders(user),
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(5000),
            });
            const data = await response.json();
            if (!response.ok) throw new HttpException(data, response.status);
            return data;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(
                { status: 'error', message: 'Service unreachable' },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    private async proxyGet(url: string, user?: { sub: string; email: string; role: string }) {
        try {
            const response = await fetch(url, {
                headers: this.buildUserHeaders(user),
                signal: AbortSignal.timeout(5000),
            });
            const data = await response.json();
            if (!response.ok) throw new HttpException(data, response.status);
            return data;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(
                { status: 'error', message: 'Service unreachable' },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    async login(body: { email: string; password: string }) {
        return this.proxyPost(`${this.serviceUrls.auth}/auth/login`, body);
    }

    async refresh(body: { refresh_token: string }) {
        return this.proxyPost(`${this.serviceUrls.auth}/auth/refresh`, body);
    }

    async logout(body: { refresh_token: string }) {
        return this.proxyPost(`${this.serviceUrls.auth}/auth/logout`, body);
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

    async seedDatabase() {
        const result = await runSeed(this.prisma, true);
        return { success: true, ...result };
    }

    async executePostgreSQL(query: string) {
        const result = await this.prisma.$queryRawUnsafe(query);
        const rows = result as any[];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return { columns, rows, rowCount: rows.length };
    }

    executeRedis(command: string) {
        return this.redisService.executeCommand(command);
    }

    listRabbitMQQueues() {
        return this.rabbitMQService.listQueues();
    }

    getRabbitMQMessages(queue: string, count: number) {
        return this.rabbitMQService.getMessages(queue, count);
    }

    executeMongoDB(command: string) {
        return this.mongoDBService.executeCommand(command);
    }

    async listPostgresTables() {
        const result = await this.prisma.$queryRawUnsafe(
            `SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name`,
        );
        return { tables: result as any[] };
    }

    async getPostgresTableData(table: string, page: number, pageSize: number) {
        const offset = (page - 1) * pageSize;
        const rows = await this.prisma.$queryRawUnsafe<
            { [key: string]: unknown }[]
        >(`SELECT * FROM "${table}" LIMIT ${pageSize} OFFSET ${offset}`);
        const countResult = await this.prisma.$queryRawUnsafe<
            { count: string }[]
        >(`SELECT COUNT(*) as count FROM "${table}"`);
        const totalCount = Number(countResult[0]?.count ?? 0);
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return {
            columns,
            rows,
            totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    }

    async listMongoCollections() {
        const db = await this.mongoDBService.getDb();
        const collections = await db.listCollections().toArray();
        return { collections: collections.map((c: any) => ({ name: c.name })) };
    }

    async getMongoCollectionData(
        collection: string,
        page: number,
        pageSize: number,
    ) {
        const db = await this.mongoDBService.getDb();
        const coll = db.collection(collection);
        const offset = (page - 1) * pageSize;
        const raw = await coll.find({}).skip(offset).limit(pageSize).toArray();
        const totalCount = await coll.countDocuments();
        const rows = raw.map((r: any) => {
            const { _id, ...rest } = r;
            return { _id: String(_id ?? ''), ...rest };
        });
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return {
            columns,
            rows,
            totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    }

    async logFromFrontend(body: {
        level: string;
        message: string;
        metadata?: Record<string, unknown>;
    }) {
        const db = await this.mongoDBService.getDb();
        await db.collection('frontend_logs').insertOne({
            level: body.level || 'error',
            message: body.message,
            timestamp: new Date(),
            metadata: body.metadata || {},
        });
        return { success: true };
    }

    async getLogs(
        collectionName: string,
        level?: string,
        service?: string,
        page: number = 1,
        pageSize: number = 50,
    ) {
        const db = await this.mongoDBService.getDb();
        const coll = db.collection(collectionName);

        const filter: Record<string, unknown> = {};
        if (level && level !== 'all') filter.level = level;
        if (service) filter.service = service;

        const offset = (page - 1) * pageSize;
        const totalCount = await coll.countDocuments(filter);
        const raw = await coll
            .find(filter)
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(pageSize)
            .toArray();

        const logs = raw.map((r: any) => {
            const { _id, ...rest } = r;
            return { _id: String(_id ?? ''), ...rest };
        });

        return {
            logs,
            totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
        };
    }

    async clearLogs(collectionName: string) {
        const db = await this.mongoDBService.getDb();
        const result = await db.collection(collectionName).deleteMany({});
        return { deletedCount: result.deletedCount };
    }
}
