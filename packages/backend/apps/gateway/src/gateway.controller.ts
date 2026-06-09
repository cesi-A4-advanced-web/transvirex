import { BlockInProduction } from '@app/guards';
import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { GatewayService } from './gateway.service';

const ACCESS_TOKEN_TTL = parseInt(process.env.JWT_ACCESS_TTL || '180') * 1000;
const REFRESH_TOKEN_TTL = parseInt(process.env.JWT_REFRESH_TTL || '604800') * 1000;

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

    @Get('auth/me')
    me(@Req() req: Request) {
        return (req as any).user;
    }

    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('auth/login')
    async login(
        @Body() body: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const data = await this.gatewayService.login(body);
        res.cookie(
            'access_token',
            data.access_token,
            accessTokenCookieOptions(ACCESS_TOKEN_TTL),
        );
        res.cookie(
            'refresh_token',
            data.refresh_token,
            refreshTokenCookieOptions(REFRESH_TOKEN_TTL),
        );
        return { success: true };
    }

    @Public()
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
            accessTokenCookieOptions(ACCESS_TOKEN_TTL),
        );
        res.cookie(
            'refresh_token',
            data.refresh_token,
            refreshTokenCookieOptions(REFRESH_TOKEN_TTL),
        );
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

    @Public()
    @Get('debug/postgresql/tables')
    @BlockInProduction()
    async listPostgresTables() {
        return this.gatewayService.listPostgresTables();
    }

    @Public()
    @Post('debug/postgresql/tables/:table/data')
    @BlockInProduction()
    async getPostgresTableData(
        @Param('table') table: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        return this.gatewayService.getPostgresTableData(table, page, pageSize);
    }

    @Public()
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

    @Public()
    @Get('debug/rabbitmq/queues')
    @BlockInProduction()
    async listRabbitMQQueues() {
        return this.gatewayService.listRabbitMQQueues();
    }

    @Public()
    @Post('debug/rabbitmq/queues/:queue/messages')
    @BlockInProduction()
    async getRabbitMQMessages(
        @Param('queue') queue: string,
        @Body('count') count?: number,
    ) {
        return this.gatewayService.getRabbitMQMessages(queue, count ?? 10);
    }

    @Public()
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

    @Public()
    @Get('debug/mongodb/collections')
    @BlockInProduction()
    async listMongoCollections() {
        return this.gatewayService.listMongoCollections();
    }

    @Public()
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

    @Public()
    @Post('debug/seed')
    @BlockInProduction()
    async seedDatabase() {
        return this.gatewayService.seedDatabase();
    }

    @Post('logs/frontend')
    async logFromFrontend(
        @Body()
        body: {
            level: string;
            message: string;
            metadata?: Record<string, unknown>;
        },
    ) {
        return this.gatewayService.logFromFrontend(body);
    }

    @Get('debug/logs/backend')
    @BlockInProduction()
    async getBackendLogs(
        @Query('level') level?: string,
        @Query('service') service?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ) {
        return this.gatewayService.getLogs(
            'banckend_logs',
            level,
            service,
            parseInt(page),
            parseInt(pageSize),
        );
    }

    @Get('debug/logs/frontend')
    @BlockInProduction()
    async getFrontendLogs(
        @Query('level') level?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ) {
        return this.gatewayService.getLogs(
            'frontend_logs',
            level,
            undefined,
            parseInt(page),
            parseInt(pageSize),
        );
    }

    @Delete('debug/logs/backend')
    @BlockInProduction()
    async clearBackendLogs() {
        return this.gatewayService.clearLogs('banckend_logs');
    }

    @Delete('debug/logs/frontend')
    @BlockInProduction()
    async clearFrontendLogs() {
        return this.gatewayService.clearLogs('frontend_logs');
    }
}
