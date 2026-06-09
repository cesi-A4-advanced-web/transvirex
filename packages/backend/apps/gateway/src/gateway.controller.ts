import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { BlockInProduction } from '@app/guards';
import { Request, Response } from 'express';
import type { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

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
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const data = await this.gatewayService.login(body);
        res.cookie(
            'access_token',
            data.access_token,
            cookieOptions(ACCESS_TOKEN_TTL),
        );
        res.cookie(
            'refresh_token',
            data.refresh_token,
            cookieOptions(REFRESH_TOKEN_TTL),
        );
        return { success: true };
    }

    @Post('auth/refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;
        const data = await this.gatewayService.refresh({
            refresh_token: refreshToken,
        });
        res.cookie(
            'access_token',
            data.access_token,
            cookieOptions(ACCESS_TOKEN_TTL),
        );
        res.cookie(
            'refresh_token',
            data.refresh_token,
            cookieOptions(REFRESH_TOKEN_TTL),
        );
        return { success: true };
    }

    @Post('auth/logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;
        await this.gatewayService.logout({ refresh_token: refreshToken });
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { success: true };
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
