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
import type { Request, Response } from 'express';
import { GatewayService } from './gateway.service';
import { Public } from './decorators/public.decorator';

const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

const accessTokenCookieOptions = (maxAge: number) => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

const refreshTokenCookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

@Controller()
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @Public()
    @Get()
    getHello(): string {
        return this.gatewayService.getHello();
    }

    @Public()
    @Get('gateway/health')
    getGatewayHealth() {
        return this.gatewayService.getGatewayHealth();
    }

    @Public()
    @Get('auth/health')
    getAuthHealth() {
        return this.gatewayService.getAuthHealth();
    }

    @Public()
    @Get('billing/health')
    getBillingHealth() {
        return this.gatewayService.getBillingHealth();
    }

    @Public()
    @Get('stock/health')
    getStockHealth() {
        return this.gatewayService.getStockHealth();
    }

    @Public()
    @Get('delivery/health')
    getDeliveryHealth() {
        return this.gatewayService.getDeliveryHealth();
    }

    @Public()
    @Get('users/health')
    getUsersHealth() {
        return this.gatewayService.getUsersHealth();
    }

    @Public()
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

    @Public()
    @Post('auth/login')
    async login(
        @Body() body: { email: string; password: string },
        @Res({ passthrough: true }) res: Response,
    ) {
        const data = await this.gatewayService.login(body);
        res.cookie('access_token', data.access_token, accessTokenCookieOptions(ACCESS_TOKEN_TTL));
        res.cookie('refresh_token', data.refresh_token, refreshTokenCookieOptions(REFRESH_TOKEN_TTL));
        return { success: true };
    }

    @Public()
    @Post('auth/refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;
        const data = await this.gatewayService.refresh({ refresh_token: refreshToken });
        res.cookie('access_token', data.access_token, accessTokenCookieOptions(ACCESS_TOKEN_TTL));
        res.cookie('refresh_token', data.refresh_token, refreshTokenCookieOptions(REFRESH_TOKEN_TTL));
        return { success: true };
    }

    @Public()
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

    @Public()
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

    @Public()
    @Get('debug/rabbitmq/queues')
    async listRabbitMQQueues() {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.listRabbitMQQueues();
    }

    @Public()
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

    @Public()
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

    @Public()
    @Get('debug/postgresql/tables')
    async listPostgresTables() {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.listPostgresTables();
    }

    @Public()
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

    @Public()
    @Get('debug/mongodb/collections')
    async listMongoCollections() {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        return this.gatewayService.listMongoCollections();
    }

    @Public()
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
