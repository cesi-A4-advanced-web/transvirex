import { PrismaService } from '@app/database';
import { seedDatabase as runSeed } from '@app/database/seed';
import { MongoDBService } from '@app/mongodb';
import { RabbitMQService } from '@app/rabbitmq';
import { RedisService } from '@app/redis';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

/** French labels for delivery statuses, used in driver notifications. */
const DELIVERY_STATUS_LABELS: Record<string, string> = {
    planned: 'Planifiée',
    delivering: 'En cours',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    blocked: 'Bloquée',
    delayed: 'Retardée',
};

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
        ai: process.env.AI_SERVICE_URL || 'http://transvirex-ai:5000',
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

    /**
     * Create a driver-facing notification in the shared MongoDB `notifications`
     * collection (read back by the AI service's /ai/notifications). Best-effort:
     * never fails the originating request.
     */
    private async createDriverNotification(
        recipientUserId: string | null | undefined,
        summary: string,
        deliveryId: string,
        type: 'assignment' | 'status',
    ): Promise<void> {
        if (!recipientUserId) return;
        try {
            const db = await this.mongoDBService.getDb();
            await db.collection('notifications').insertOne({
                audience: 'driver',
                recipient_id: recipientUserId,
                type,
                delivery_id: deliveryId,
                summary,
                severity: 'INFO',
                read: false,
                created_at: new Date(),
            });
        } catch {
            // Notifications are best-effort — swallow errors.
        }
    }

    /** Append optional query parameters to a URL. */
    private appendQuery(base: string, params: Record<string, string | number | undefined>): string {
        const search = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== '') {
                search.set(key, String(value));
            }
        }
        const query = search.toString();
        return query ? `${base}?${query}` : base;
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

    /** Proxy a DELETE request to a downstream microservice. */
    private async proxyDelete(url: string, user?: { sub: string; email: string; role: string }) {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
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

    /** Update driver GPS position via the delivery service. */
    updatePosition(body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPatch(`${this.serviceUrls.delivery}/deliveries/position`, body, user);
    }

    /** Get driver position via the delivery service. */
    getDriverPosition(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.delivery}/drivers/${id}/position`, user);
    }

    /** Update delivery status via the delivery service, then notify the driver when changed by someone else. */
    async updateDeliveryStatus(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        const result = await this.proxyPatch(`${this.serviceUrls.delivery}/deliveries/${id}/status`, body, user);
        // Notify the assigned driver only when the change was made by a dispatcher/admin.
        if (user?.role !== 'driver') {
            const status = (body as { status?: string })?.status ?? '';
            const delivery = await this.prisma.delivery.findUnique({
                where: { id },
                select: { reference: true, driver: { select: { user_id: true } } },
            });
            if (delivery?.driver?.user_id) {
                const label = DELIVERY_STATUS_LABELS[status] ?? status;
                await this.createDriverNotification(
                    delivery.driver.user_id,
                    `Statut mis à jour : ${delivery.reference} → ${label}`,
                    id,
                    'status',
                );
            }
        }
        return result;
    }

    // ─── Vehicles ───────────────────────────────────────────────────────────

    listVehicles(hub_id?: string, user?: { sub: string; email: string; role: string }) {
        const query = hub_id ? `?hub_id=${encodeURIComponent(hub_id)}` : '';
        return this.proxyGet(`${this.serviceUrls.stock}/vehicles${query}`, user);
    }

    createVehicle(body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPost(`${this.serviceUrls.stock}/vehicles`, body, user);
    }

    updateVehicle(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPatch(`${this.serviceUrls.stock}/vehicles/${id}`, body, user);
    }

    deleteVehicle(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyDelete(`${this.serviceUrls.stock}/vehicles/${id}`, user);
    }

    // ─── Hub Capacity ───────────────────────────────────────────────────────

    getHubCapacity(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.delivery}/hubs/${id}/capacity`, user);
    }

    // ─── Invoice Parcels ────────────────────────────────────────────────────

    addParcel(invoiceId: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPost(`${this.serviceUrls.billing}/invoices/${invoiceId}/parcels`, body, user);
    }

    listParcels(invoiceId: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.billing}/invoices/${invoiceId}/parcels`, user);
    }

    deleteParcel(invoiceId: string, parcelId: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyDelete(`${this.serviceUrls.billing}/invoices/${invoiceId}/parcels/${parcelId}`, user);
    }

    /** List customers via the billing service. */
    listCustomers(hub_id?: string, user?: { sub: string; email: string; role: string }) {
        const query = hub_id ? `?hub_id=${encodeURIComponent(hub_id)}` : '';
        return this.proxyGet(`${this.serviceUrls.billing}/customers${query}`, user);
    }

    /** Proxy health check to the authentication service. */
    getAuthHealth() {
        return this.fetchHealth('auth', this.serviceUrls.auth);
    }

    /** Proxy health check to the billing service. */
    getBillingHealth() {
        return this.fetchHealth('billing', this.serviceUrls.billing);
    }

    /** List invoices via the billing service. */
    getInvoices(
        page: number,
        limit: number,
        filters: {
            status?: string;
            customer_id?: string;
            hub_id?: string;
            due_date_from?: string;
            due_date_to?: string;
        } = {},
        user?: { sub: string; email: string; role: string },
    ) {
        return this.proxyGet(
            this.appendQuery(`${this.serviceUrls.billing}/invoices`, {
                page,
                limit,
                ...filters,
            }),
            user,
        );
    }

    /** Get an invoice by ID via the billing service. */
    getInvoice(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.billing}/invoices/${id}`, user);
    }

    /** Create an invoice via the billing service. */
    createInvoice(body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPost(`${this.serviceUrls.billing}/invoices`, body, user);
    }

    /** Update an invoice via the billing service. */
    updateInvoice(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPatch(`${this.serviceUrls.billing}/invoices/${id}`, body, user);
    }

    /** Transition invoice status via the billing service. */
    updateInvoiceStatus(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPatch(`${this.serviceUrls.billing}/invoices/${id}/status`, body, user);
    }

    /** List deliveries via the delivery service. */
    getDeliveries(
        page: number,
        limit: number,
        filters: {
            status?: string;
            hub_id?: string;
            driver_id?: string;
            date_from?: string;
            date_to?: string;
        } = {},
        user?: { sub: string; email: string; role: string },
    ) {
        return this.proxyGet(
            this.appendQuery(`${this.serviceUrls.delivery}/deliveries`, {
                page,
                limit,
                ...filters,
            }),
            user,
        );
    }

    /** Get the authenticated driver's dashboard via the delivery service. Scoped to the JWT sub. Scope: "today" (default) or "all". */
    getMyDriverDashboard(user?: { sub: string; email: string; role: string }, scope?: string) {
        return this.proxyGet(
            this.appendQuery(`${this.serviceUrls.delivery}/drivers/${user?.sub}/dashboard`, { scope }),
            user,
        );
    }

    /** Get the authenticated driver's profile (info, vehicle, stats) via the delivery service. Scoped to the JWT sub. */
    getMyDriverProfile(user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.delivery}/drivers/${user?.sub}/profile`, user);
    }

    /** Get a delivery by ID via the delivery service. */
    getDelivery(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.delivery}/deliveries/${id}`, user);
    }

    /** Create a delivery via the delivery service. */
    createDelivery(body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPost(`${this.serviceUrls.delivery}/deliveries`, body, user);
    }

    /** Update a delivery via the delivery service, then notify the driver if (re)assigned. */
    async updateDelivery(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        const result = await this.proxyPatch(`${this.serviceUrls.delivery}/deliveries/${id}`, body, user);
        const driverId = (body as { driver_id?: string })?.driver_id;
        if (driverId) {
            const driver = await this.prisma.driver.findUnique({
                where: { id: driverId },
                select: { user_id: true },
            });
            const reference = (result as { reference?: string })?.reference ?? '';
            await this.createDriverNotification(
                driver?.user_id,
                `Nouvelle livraison assignée : ${reference}`,
                id,
                'assignment',
            );
        }
        return result;
    }

    /** Delete a delivery via the delivery service. */
    deleteDelivery(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyDelete(`${this.serviceUrls.delivery}/deliveries/${id}`, user);
    }

    /** List users via the users service. */
    getUsers(
        page: number,
        limit: number,
        filters: {
            hub_id?: string;
            role?: string;
            status?: string;
        } = {},
        user?: { sub: string; email: string; role: string },
    ) {
        return this.proxyGet(
            this.appendQuery(`${this.serviceUrls.users}/users`, {
                page,
                limit,
                ...filters,
            }),
            user,
        );
    }

    /** Get a user by ID via the users service. */
    getUser(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyGet(`${this.serviceUrls.users}/users/${id}`, user);
    }

    /** Create a user via the users service. */
    createUser(body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPost(`${this.serviceUrls.users}/users`, body, user);
    }

    /** Update a user via the users service. */
    updateUser(id: string, body: unknown, user?: { sub: string; email: string; role: string }) {
        return this.proxyPatch(`${this.serviceUrls.users}/users/${id}`, body, user);
    }

    /** Delete a user via the users service. */
    deleteUser(id: string, user?: { sub: string; email: string; role: string }) {
        return this.proxyDelete(`${this.serviceUrls.users}/users/${id}`, user);
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

    /** Proxy a POST to the AI service with an extended 30-second timeout for LLM calls. */
    async aiPost(path: string, body: unknown) {
        try {
            const response = await fetch(`${this.serviceUrls.ai}/ai/${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(30000),
            });
            const data = await response.json();
            if (!response.ok) throw new HttpException(data, response.status);
            return data;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(
                { status: 'error', message: 'AI service unreachable' },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    /** Proxy a GET to the AI service. */
    async aiGet(path: string) {
        try {
            const response = await fetch(`${this.serviceUrls.ai}/ai/${path}`, {
                signal: AbortSignal.timeout(30000),
            });
            const data = await response.json();
            if (!response.ok) throw new HttpException(data, response.status);
            return data;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(
                { status: 'error', message: 'AI service unreachable' },
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    /** Delete all documents from a log collection. */
    async clearLogs(collectionName: string) {
        const db = await this.mongoDBService.getDb();
        const result = await db.collection(collectionName).deleteMany({});
        return { deletedCount: result.deletedCount };
    }
}
