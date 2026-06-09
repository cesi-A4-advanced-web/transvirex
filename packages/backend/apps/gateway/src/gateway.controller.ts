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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import { LogFrontendDto } from './dto/log-frontend.dto';
import { LoginDto } from './dto/login.dto';
import { GatewayService } from './gateway.service';

/** Access token cookie max-age in milliseconds. */
const ACCESS_TOKEN_TTL = parseInt(process.env.JWT_ACCESS_TTL || '180') * 1000;
/** Refresh token cookie max-age in milliseconds. */
const REFRESH_TOKEN_TTL = parseInt(process.env.JWT_REFRESH_TTL || '604800') * 1000;

/** Returns cookie options for the access_token cookie. */
const accessTokenCookieOptions = (maxAge: number) => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

/** Returns cookie options for the refresh_token cookie. */
const refreshTokenCookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

/** Main API gateway controller exposing public, auth, debug, and logging endpoints. */
@Controller()
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Gateway')
    @Public()
    @Get()
    @ApiOperation({
        summary: 'Hello',
        description: 'Root endpoint - returns a greeting message',
    })
    @ApiResponse({
        status: 200,
        description: 'Greeting message',
        schema: { type: 'string' },
    })
    getHello(): string {
        return this.gatewayService.getHello();
    }

    /** Health check for the gateway itself. */
    @ApiTags('Gateway')
    @Public()
    @Get('gateway/health')
    @ApiOperation({ summary: 'Gateway health check' })
    @ApiResponse({ status: 200, description: 'Gateway service is healthy' })
    getGatewayHealth() {
        return this.gatewayService.getGatewayHealth();
    }

    /** Health check for the authentication service. */
    @ApiTags('Health')
    @Public()
    @Get('auth/health')
    @ApiOperation({ summary: 'Authentication service health check' })
    @ApiResponse({
        status: 200,
        description: 'Authentication service is healthy',
    })
    getAuthHealth() {
        return this.gatewayService.getAuthHealth();
    }

    /** Health check for the billing service. */
    @ApiTags('Health')
    @Public()
    @Get('billing/health')
    @ApiOperation({ summary: 'Billing service health check' })
    @ApiResponse({ status: 200, description: 'Billing service is healthy' })
    getBillingHealth() {
        return this.gatewayService.getBillingHealth();
    }

    /** Health check for the stock service. */
    @ApiTags('Health')
    @Public()
    @Get('stock/health')
    @ApiOperation({ summary: 'Stock service health check' })
    @ApiResponse({ status: 200, description: 'Stock service is healthy' })
    getStockHealth() {
        return this.gatewayService.getStockHealth();
    }

    /** Health check for the delivery service. */
    @ApiTags('Health')
    @Public()
    @Get('delivery/health')
    @ApiOperation({ summary: 'Delivery service health check' })
    @ApiResponse({ status: 200, description: 'Delivery service is healthy' })
    getDeliveryHealth() {
        return this.gatewayService.getDeliveryHealth();
    }

    /** Health check for the users service. */
    @ApiTags('Health')
    @Public()
    @Get('users/health')
    @ApiOperation({ summary: 'Users service health check' })
    @ApiResponse({ status: 200, description: 'Users service is healthy' })
    getUsersHealth() {
        return this.gatewayService.getUsersHealth();
    }

    /** Return the authenticated user's JWT payload. */
    @ApiTags('Authentication')
    @Get('auth/me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get current user',
        description: "Returns the authenticated user's JWT payload (sub, email, role)",
    })
    @ApiResponse({ status: 200, description: 'Current user information' })
    @ApiResponse({
        status: 401,
        description: 'Access token missing or invalid',
    })
    me(@Req() req: Request) {
        return (req as any).user;
    }

    /** Authenticate user, set access_token and refresh_token cookies. */
    @ApiTags('Authentication')
    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('auth/login')
    @ApiOperation({
        summary: 'Login',
        description: 'Authenticate with email and password. Sets access_token and refresh_token cookies on success.',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 201,
        description: 'Login successful - cookies set',
        schema: {
            type: 'object',
            properties: { success: { type: 'boolean', example: true } },
        },
    })
    @ApiResponse({ status: 401, description: 'Invalid email or password' })
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.gatewayService.login(body);
        res.cookie('access_token', data.access_token, accessTokenCookieOptions(ACCESS_TOKEN_TTL));
        res.cookie('refresh_token', data.refresh_token, refreshTokenCookieOptions(REFRESH_TOKEN_TTL));
        return { success: true };
    }

    /** Refresh tokens using the refresh_token cookie. */
    @ApiTags('Authentication')
    @Public()
    @Post('auth/refresh')
    @ApiOperation({
        summary: 'Refresh tokens',
        description: 'Refresh the access token using the refresh_token cookie set during login.',
    })
    @ApiResponse({
        status: 201,
        description: 'Tokens refreshed - new cookies set',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired refresh token',
    })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        const data = await this.gatewayService.refresh({
            refresh_token: refreshToken,
        });
        res.cookie('access_token', data.access_token, accessTokenCookieOptions(ACCESS_TOKEN_TTL));
        res.cookie('refresh_token', data.refresh_token, refreshTokenCookieOptions(REFRESH_TOKEN_TTL));
        return { success: true };
    }

    /** Invalidate the refresh token and clear auth cookies. */
    @ApiTags('Authentication')
    @Public()
    @Post('auth/logout')
    @ApiOperation({
        summary: 'Logout',
        description: 'Invalidate the refresh token and clear authentication cookies.',
    })
    @ApiResponse({
        status: 201,
        description: 'Logged out successfully - cookies cleared',
    })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        await this.gatewayService.logout({ refresh_token: refreshToken });
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { success: true };
    }

    /** Execute an arbitrary SQL query on PostgreSQL (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Post('debug/postgresql')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Execute PostgreSQL query',
        description:
            'Execute an arbitrary SQL query on the PostgreSQL database. Only available in non-production environments.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['query'],
            properties: {
                query: {
                    type: 'string',
                    description: 'SQL query to execute',
                    example: 'SELECT * FROM users LIMIT 5',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Query result' })
    @ApiResponse({
        status: 403,
        description: 'Not available in production or invalid query',
    })
    async executePostgreSQL(@Body('query') query: string) {
        if (!query || typeof query !== 'string') {
            throw new ForbiddenException('query is required and must be a string');
        }
        return this.gatewayService.executePostgreSQL(query);
    }

    /** List all PostgreSQL tables (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Get('debug/postgresql/tables')
    @BlockInProduction()
    @ApiOperation({
        summary: 'List PostgreSQL tables',
        description: 'List all tables in the PostgreSQL database. Only available in non-production environments.',
    })
    @ApiResponse({ status: 200, description: 'List of database tables' })
    async listPostgresTables() {
        return this.gatewayService.listPostgresTables();
    }

    @ApiTags('Debug')
    @Public()
    @Post('debug/postgresql/tables/:table/data')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get PostgreSQL table data',
        description: 'Fetch paginated data from a PostgreSQL table. Only available in non-production environments.',
    })
    @ApiParam({ name: 'table', description: 'Table name', example: 'users' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number (1-based)',
                    default: 1,
                    example: 1,
                },
                pageSize: {
                    type: 'number',
                    description: 'Number of rows per page',
                    default: 25,
                    example: 25,
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Paginated table data' })
    async getPostgresTableData(
        @Param('table') table: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        return this.gatewayService.getPostgresTableData(table, page, pageSize);
    }

    /** Execute an arbitrary Redis command (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Post('debug/redis')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Execute Redis command',
        description: 'Execute an arbitrary Redis command. Only available in non-production environments.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['command'],
            properties: {
                command: {
                    type: 'string',
                    description: 'Redis command to execute',
                    example: 'KEYS *',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Command result' })
    @ApiResponse({
        status: 403,
        description: 'Not available in production or invalid command',
    })
    async executeRedis(@Body('command') command: string) {
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException('command is required and must be a string');
        }
        return this.gatewayService.executeRedis(command);
    }

    /** List all RabbitMQ queues (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Get('debug/rabbitmq/queues')
    @BlockInProduction()
    @ApiOperation({
        summary: 'List RabbitMQ queues',
        description: 'List all RabbitMQ queues. Only available in non-production environments.',
    })
    @ApiResponse({ status: 200, description: 'List of RabbitMQ queues' })
    async listRabbitMQQueues() {
        return this.gatewayService.listRabbitMQQueues();
    }

    @ApiTags('Debug')
    @Public()
    @Post('debug/rabbitmq/queues/:queue/messages')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get RabbitMQ messages',
        description: 'Fetch messages from a RabbitMQ queue. Only available in non-production environments.',
    })
    @ApiParam({
        name: 'queue',
        description: 'Queue name',
        example: 'task_queue',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                count: {
                    type: 'number',
                    description: 'Number of messages to fetch',
                    default: 10,
                    example: 10,
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Messages from the queue' })
    async getRabbitMQMessages(@Param('queue') queue: string, @Body('count') count?: number) {
        return this.gatewayService.getRabbitMQMessages(queue, count ?? 10);
    }

    /** Execute an arbitrary MongoDB command (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Post('debug/mongodb')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Execute MongoDB command',
        description: 'Execute an arbitrary MongoDB command. Only available in non-production environments.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['command'],
            properties: {
                command: {
                    type: 'string',
                    description: 'MongoDB command to execute (JSON)',
                    example: '{"find": "users", "limit": 5}',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Command result' })
    @ApiResponse({
        status: 403,
        description: 'Not available in production or invalid command',
    })
    async executeMongoDB(@Body('command') command: string) {
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException('command is required and must be a string');
        }
        return this.gatewayService.executeMongoDB(command);
    }

    /** List all MongoDB collections (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Get('debug/mongodb/collections')
    @BlockInProduction()
    @ApiOperation({
        summary: 'List MongoDB collections',
        description: 'List all MongoDB collections. Only available in non-production environments.',
    })
    @ApiResponse({ status: 200, description: 'List of MongoDB collections' })
    async listMongoCollections() {
        return this.gatewayService.listMongoCollections();
    }

    @ApiTags('Debug')
    @Public()
    @Post('debug/mongodb/collections/:collection/data')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get MongoDB collection data',
        description:
            'Fetch paginated documents from a MongoDB collection. Only available in non-production environments.',
    })
    @ApiParam({
        name: 'collection',
        description: 'Collection name',
        example: 'users',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    description: 'Page number (1-based)',
                    default: 1,
                    example: 1,
                },
                pageSize: {
                    type: 'number',
                    description: 'Number of documents per page',
                    default: 25,
                    example: 25,
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Paginated collection data' })
    async getMongoCollectionData(
        @Param('collection') collection: string,
        @Body('page') page: number = 1,
        @Body('pageSize') pageSize: number = 25,
    ) {
        return this.gatewayService.getMongoCollectionData(collection, page, pageSize);
    }

    /** Seed the database with test data (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Post('debug/seed')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Seed database',
        description: 'Seed the database with test data. Only available in non-production environments.',
    })
    @ApiResponse({ status: 201, description: 'Database seeded successfully' })
    async seedDatabase() {
        return this.gatewayService.seedDatabase();
    }

    /** Ingest a log entry from the frontend application. */
    @ApiTags('Logging')
    @Post('logs/frontend')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Ingest frontend log',
        description: 'Send a log entry from the frontend application.',
    })
    @ApiBody({ type: LogFrontendDto })
    @ApiResponse({ status: 201, description: 'Log entry created' })
    @ApiResponse({
        status: 401,
        description: 'Access token missing or invalid',
    })
    async logFromFrontend(@Body() body: LogFrontendDto) {
        return this.gatewayService.logFromFrontend(body);
    }

    /** Fetch backend service logs with optional filters (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Get('debug/logs/backend')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get backend logs',
        description:
            'Fetch backend service logs with optional filtering. Only available in non-production environments.',
    })
    @ApiQuery({
        name: 'level',
        required: false,
        description: 'Filter by log level',
        example: 'error',
    })
    @ApiQuery({
        name: 'service',
        required: false,
        description: 'Filter by service name',
        example: 'gateway',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number (1-based)',
        example: '1',
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Number of logs per page',
        example: '50',
    })
    @ApiResponse({ status: 200, description: 'Paginated backend logs' })
    async getBackendLogs(
        @Query('level') level?: string,
        @Query('service') service?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ) {
        return this.gatewayService.getLogs('banckend_logs', level, service, parseInt(page), parseInt(pageSize));
    }

    /** Fetch frontend application logs with optional filters (non-production only). */
    @ApiTags('Debug')
    @Public()
    @Get('debug/logs/frontend')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get frontend logs',
        description:
            'Fetch frontend application logs with optional filtering. Only available in non-production environments.',
    })
    @ApiQuery({
        name: 'level',
        required: false,
        description: 'Filter by log level',
        example: 'error',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number (1-based)',
        example: '1',
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Number of logs per page',
        example: '50',
    })
    @ApiResponse({ status: 200, description: 'Paginated frontend logs' })
    async getFrontendLogs(
        @Query('level') level?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ) {
        return this.gatewayService.getLogs('frontend_logs', level, undefined, parseInt(page), parseInt(pageSize));
    }

    /** Delete all backend service logs (non-production only). */
    @ApiTags('Debug')
    @Delete('debug/logs/backend')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Clear backend logs',
        description: 'Delete all backend service logs. Only available in non-production environments.',
    })
    @ApiResponse({ status: 200, description: 'Backend logs cleared' })
    async clearBackendLogs() {
        return this.gatewayService.clearLogs('banckend_logs');
    }

    /** Delete all frontend application logs (non-production only). */
    @ApiTags('Debug')
    @Delete('debug/logs/frontend')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Clear frontend logs',
        description: 'Delete all frontend application logs. Only available in non-production environments.',
    })
    @ApiResponse({ status: 200, description: 'Frontend logs cleared' })
    async clearFrontendLogs() {
        return this.gatewayService.clearLogs('frontend_logs');
    }
}
