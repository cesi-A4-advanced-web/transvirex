import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
} from '@nestjs/common';
import { BlockInProduction } from '@app/guards';
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
    @BlockInProduction()
    async executePostgreSQL(@Body('query') query: string) {
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
    @BlockInProduction()
    async executeRedis(@Body('command') command: string) {
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException(
                'command is required and must be a string',
            );
        }
        return this.gatewayService.executeRedis(command);
    }

    @Get('debug/rabbitmq/queues')
    @BlockInProduction()
    async listRabbitMQQueues() {
        return this.gatewayService.listRabbitMQQueues();
    }

    @Post('debug/rabbitmq/queues/:queue/messages')
    @BlockInProduction()
    async getRabbitMQMessages(
        @Param('queue') queue: string,
        @Body('count') count?: number,
    ) {
        return this.gatewayService.getRabbitMQMessages(queue, count ?? 10);
    }

    @Post('debug/mongodb')
    @BlockInProduction()
    async executeMongoDB(@Body('command') command: string) {
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException(
                'command is required and must be a string',
            );
        }
        return this.gatewayService.executeMongoDB(command);
    }

    @Get('debug/postgresql/tables')
    @BlockInProduction()
    async listPostgresTables() {
        return this.gatewayService.listPostgresTables();
    }

    @Post('debug/postgresql/tables/:table/data')
    @BlockInProduction()
    async getPostgresTableData(
        @Param('table') table: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        return this.gatewayService.getPostgresTableData(table, page, pageSize);
    }

    @Post('debug/seed')
    @BlockInProduction()
    async seedDatabase() {
        return this.gatewayService.seedDatabase();
    }

    @Get('debug/mongodb/collections')
    @BlockInProduction()
    async listMongoCollections() {
        return this.gatewayService.listMongoCollections();
    }

    @Post('debug/mongodb/collections/:collection/data')
    @BlockInProduction()
    async getMongoCollectionData(
        @Param('collection') collection: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        return this.gatewayService.getMongoCollectionData(
            collection,
            page,
            pageSize,
        );
    }
}
