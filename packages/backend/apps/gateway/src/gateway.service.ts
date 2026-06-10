import { PrismaService } from '@app/database';
import { seedDatabase as runSeed } from '@app/database/seed';
import { MongoDBService } from '@app/mongodb';
import { RabbitMQService } from '@app/rabbitmq';
import { RedisService } from '@app/redis';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

/** Service aggregating health checks, auth proxy, and debug operations for the gateway. */
@Injectable()
export class GatewayService {
    /** Internal URLs of each microservice. */
    private readonly serviceUrls = {
        auth: process.env.AUTH_SERVICE_URL || 'http://transvirex-authentication:3000',
        billing: process.env.BILLING_SERVICE_URL || 'http://transvirex-billing:3000',
        delivery: process.env.DELIVERY_SERVICE_URL || 'http://transvirex-delivery:3000',
        stock: process.env.STOCK_SERVICE_URL || 'http://transvirex-stock:3000',
        users: process.env.USERS_SERVICE_URL || 'http://transvirex-users:3000',
    };

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly rabbitMQService: RabbitMQService,
        private readonly mongoDBService: MongoDBService,
    ) {}

    /** Fetch the health status of a downstream service. */
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

    /** Build headers to propagate user identity to downstream services. */
    private buildUserHeaders(user?: { sub: string; email: string; role: string }): Record<string, string> {
        if (!user) return {};
        return {
            'X-User-Id': user.sub,
            'X-User-Email': user.email ?? '',
            'X-User-Role': user.role ?? '',
        };
    }

    /** Proxy a POST request to a downstream microservice. */
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

    /** Proxy a PATCH request to a downstream microservice. */
    private async proxyPatch(url: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        try {
            const response = await fetch(url, {
                method: 'PATCH',
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

    /** Proxy a GET request to a downstream microservice. */
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

    login(body: { email: string; password: string }) {
        return this.proxyPost(`${this.serviceUrls.auth}/auth/login`, body) as Promise<{
            access_token: string;
            refresh_token: string;
        }>;
    }

    refresh(body: { refresh_token: string }) {
        return this.proxyPost(`${this.serviceUrls.auth}/auth/refresh`, body) as Promise<{
            access_token: string;
            refresh_token: string;
        }>;
    }

    logout(body: { refresh_token: string }) {
        return this.proxyPost(`${this.serviceUrls.auth}/auth/logout`, body) as Promise<{ success: boolean }>;
    }

    /** Return a simple greeting message. */
    getHello(): string {
        return 'Hello World!';
    }

    /** Return the gateway's own health status. */
    getGatewayHealth() {
        return { status: 'ok' };
    }

    /** Create a Driver profile for a user via the users service. */
    createDriver(
        id: string,
        body: { vehicle_id?: string; rating?: number },
        user?: { sub: string; email: string; role: string },
    ) {
        return this.proxyPost(`${this.serviceUrls.users}/users/${id}/driver`, body, user);
    }

    /** Get the Driver profile for a user via the users service. */
    getDriver(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.users}/users/${id}/driver`, user);
    }

    /** List all hubs via the delivery service. */
    listHubs(user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.delivery}/hubs`, user);
    }

    /** Create a hub via the delivery service. */
    createHub(body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPost(`${this.serviceUrls.delivery}/hubs`, body, user);
    }

    /** Get hub detail with stats via the delivery service. */
    getHub(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.delivery}/hubs/${id}`, user);
    }

    /** Update a hub via the delivery service. */
    updateHub(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPatch(`${this.serviceUrls.delivery}/hubs/${id}`, body, user);
    }

    /** Proxy health check to the authentication service. */
    getAuthHealth() {
        return this.fetchHealth('auth', this.serviceUrls.auth);
    }

    /** Proxy health check to the billing service. */
    getBillingHealth() {
        return this.fetchHealth('billing', this.serviceUrls.billing);
    }

    /** Proxy health check to the stock service. */
    getStockHealth() {
        return this.fetchHealth('stock', this.serviceUrls.stock);
    }

    /** Proxy health check to the delivery service. */
    getDeliveryHealth() {
        return this.fetchHealth('delivery', this.serviceUrls.delivery);
    }

    /** Proxy health check to the users service. */
    getUsersHealth() {
        return this.fetchHealth('users', this.serviceUrls.users);
    }

    /** Seed the database with test data (force re-seed). */
    async seedDatabase() {
        const result = await runSeed(this.prisma, true);
        return { success: true, ...result };
    }

    /** Execute a raw SQL query on PostgreSQL. */
    async executePostgreSQL(query: string) {
        const result = await this.prisma.$queryRawUnsafe(query);
        const rows = result as Record<string, unknown>[];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        return { columns, rows, rowCount: rows.length };
    }

    /** Execute a Redis command. */
    executeRedis(command: string) {
        return this.redisService.executeCommand(command);
    }

    /** List all RabbitMQ queues. */
    listRabbitMQQueues() {
        return this.rabbitMQService.listQueues();
    }

    /** Fetch messages from a RabbitMQ queue. */
    getRabbitMQMessages(queue: string, count: number) {
        return this.rabbitMQService.getMessages(queue, count);
    }

    /** Execute a MongoDB command. */
    executeMongoDB(command: string) {
        return this.mongoDBService.executeCommand(command);
    }

    /** List all PostgreSQL tables. */
    async listPostgresTables() {
        const result = await this.prisma.$queryRawUnsafe(
            `SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name`,
        );
        return { tables: result as any[] };
    }

    /** Fetch paginated data from a PostgreSQL table. */
    async getPostgresTableData(table: string, page: number, pageSize: number) {
        const offset = (page - 1) * pageSize;
        const rows = await this.prisma.$queryRawUnsafe<{ [key: string]: unknown }[]>(
            `SELECT * FROM "${table}" LIMIT ${pageSize} OFFSET ${offset}`,
        );
        const countResult = await this.prisma.$queryRawUnsafe<{ count: string }[]>(
            `SELECT COUNT(*) as count FROM "${table}"`,
        );
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

    /** List all MongoDB collections. */
    async listMongoCollections() {
        const db = await this.mongoDBService.getDb();
        const collections = await db.listCollections().toArray();
        return {
            collections: collections.map((c: { name: string }) => ({
                name: c.name,
            })),
        };
    }

    /** Fetch paginated documents from a MongoDB collection. */
    async getMongoCollectionData(collection: string, page: number, pageSize: number) {
        const db = await this.mongoDBService.getDb();
        const coll = db.collection(collection);
        const offset = (page - 1) * pageSize;
        const raw = await coll.find({}).skip(offset).limit(pageSize).toArray();
        const totalCount = await coll.countDocuments();
        const rows = raw.map((r: Record<string, unknown>) => {
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

    /** Persist a frontend log entry to MongoDB. */
    async logFromFrontend(body: { level: string; message: string; metadata?: Record<string, unknown> }) {
        const db = await this.mongoDBService.getDb();
        await db.collection('frontend_logs').insertOne({
            level: body.level || 'error',
            message: body.message,
            timestamp: new Date(),
            metadata: body.metadata || {},
        });
        return { success: true };
    }

    /** Retrieve paginated logs from a MongoDB collection with optional filters. */
    async getLogs(collectionName: string, level?: string, service?: string, page: number = 1, pageSize: number = 50) {
        const db = await this.mongoDBService.getDb();
        const coll = db.collection(collectionName);

        const filter: Record<string, unknown> = {};
        if (level && level !== 'all') filter.level = level;
        if (service) filter.service = service;

        const offset = (page - 1) * pageSize;
        const totalCount = await coll.countDocuments(filter);
        const raw = await coll.find(filter).sort({ timestamp: -1 }).skip(offset).limit(pageSize).toArray();

        const logs = raw.map((r: Record<string, unknown>) => {
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

    /** Delete all documents from a log collection. */
    async clearLogs(collectionName: string) {
        const db = await this.mongoDBService.getDb();
        const result = await db.collection(collectionName).deleteMany({});
        return { deletedCount: result.deletedCount };
    }
}
