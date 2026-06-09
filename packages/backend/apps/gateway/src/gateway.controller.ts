import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @Get()
    getHello(): string {
        return this.gatewayService.getHello();
    }

    @Get('gateway/health')
    getGatewayHealth() {
        return this.gatewayService.getGatewayHealth();
    }

    @Get('auth/health')
    getAuthHealth() {
        return this.gatewayService.getAuthHealth();
    }

    @Get('billing/health')
    getBillingHealth() {
        return this.gatewayService.getBillingHealth();
    }

    @Get('stock/health')
    getStockHealth() {
        return this.gatewayService.getStockHealth();
    }

    @Get('delivery/health')
    getDeliveryHealth() {
        return this.gatewayService.getDeliveryHealth();
    }

    @Get('users/health')
    getUsersHealth() {
        return this.gatewayService.getUsersHealth();
    }

    @Post('debug/postgresql')
    async executePostgreSQL(@Body('query') query: string) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        if (!query || typeof query !== 'string') {
            throw new ForbiddenException(
                'query is required and must be a string',
            );
        }
        return this.gatewayService.executePostgreSQL(query);
    }

    @Post('auth/login')
    login(@Body() body: { email: string; password: string }) {
        return this.gatewayService.login(body);
    }

    @Post('auth/refresh')
    refresh(@Body() body: { refresh_token: string }) {
        return this.gatewayService.refresh(body);
    }

    @Post('auth/logout')
    logout(@Body() body: { refresh_token: string }) {
        return this.gatewayService.logout(body);
    }

    @Post('debug/redis')
    async executeRedis(@Body('command') command: string) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException(
                'command is required and must be a string',
            );
        }
        return this.gatewayService.executeRedis(command);
    }

    @Get('debug/rabbitmq/queues')
    async listRabbitMQQueues() {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.listRabbitMQQueues();
    }

    @Post('debug/rabbitmq/queues/:queue/messages')
    async getRabbitMQMessages(
        @Param('queue') queue: string,
        @Body('count') count?: number,
    ) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.getRabbitMQMessages(queue, count ?? 10);
    }

    @Post('debug/mongodb')
    async executeMongoDB(@Body('command') command: string) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException(
                'command is required and must be a string',
            );
        }
        return this.gatewayService.executeMongoDB(command);
    }

    @Get('debug/postgresql/tables')
    async listPostgresTables() {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.listPostgresTables();
    }

    @Post('debug/postgresql/tables/:table/data')
    async getPostgresTableData(
        @Param('table') table: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.getPostgresTableData(table, page, pageSize);
    }

    @Post('debug/seed')
    @BlockInProduction()
    async seedDatabase() {
        return this.gatewayService.seedDatabase();
    }

    @Get('debug/mongodb/collections')
    async listMongoCollections() {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.listMongoCollections();
    }

    @Post('debug/mongodb/collections/:collection/data')
    async getMongoCollectionData(
        @Param('collection') collection: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.getMongoCollectionData(
            collection,
            page,
            pageSize,
        );
    }
}
