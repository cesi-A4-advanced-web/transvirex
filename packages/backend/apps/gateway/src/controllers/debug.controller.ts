import { BlockInProduction } from '@app/guards';
import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../libs/guards/src/public.decorator';
import { GatewayService } from '../gateway.service';

@Controller()
export class DebugController {
    constructor(private readonly gatewayService: GatewayService) {}

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
                query: { type: 'string', description: 'SQL query to execute', example: 'SELECT * FROM users LIMIT 5' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Query result' })
    @ApiResponse({ status: 403, description: 'Not available in production or invalid query' })
    async executePostgreSQL(@Body('query') query: string) {
        if (!query || typeof query !== 'string') {
            throw new ForbiddenException('query is required and must be a string');
        }
        return this.gatewayService.executePostgreSQL(query);
    }

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
                page: { type: 'number', description: 'Page number (1-based)', default: 1, example: 1 },
                pageSize: { type: 'number', description: 'Number of rows per page', default: 25, example: 25 },
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
                command: { type: 'string', description: 'Redis command to execute', example: 'KEYS *' },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Command result' })
    @ApiResponse({ status: 403, description: 'Not available in production or invalid command' })
    async executeRedis(@Body('command') command: string) {
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException('command is required and must be a string');
        }
        return this.gatewayService.executeRedis(command);
    }

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
    @ApiParam({ name: 'queue', description: 'Queue name', example: 'task_queue' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number', description: 'Number of messages to fetch', default: 10, example: 10 },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Messages from the queue' })
    async getRabbitMQMessages(@Param('queue') queue: string, @Body('count') count?: number) {
        return this.gatewayService.getRabbitMQMessages(queue, count ?? 10);
    }

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
    @ApiResponse({ status: 403, description: 'Not available in production or invalid command' })
    async executeMongoDB(@Body('command') command: string) {
        if (!command || typeof command !== 'string') {
            throw new ForbiddenException('command is required and must be a string');
        }
        return this.gatewayService.executeMongoDB(command);
    }

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
    @ApiParam({ name: 'collection', description: 'Collection name', example: 'users' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                page: { type: 'number', description: 'Page number (1-based)', default: 1, example: 1 },
                pageSize: { type: 'number', description: 'Number of documents per page', default: 25, example: 25 },
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

    @ApiTags('Debug')
    @Public()
    @Get('debug/logs/backend')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get backend logs',
        description:
            'Fetch backend service logs with optional filtering. Only available in non-production environments.',
    })
    @ApiQuery({ name: 'level', required: false, description: 'Filter by log level', example: 'error' })
    @ApiQuery({ name: 'service', required: false, description: 'Filter by service name', example: 'gateway' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: '1' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Number of logs per page', example: '50' })
    @ApiResponse({ status: 200, description: 'Paginated backend logs' })
    async getBackendLogs(
        @Query('level') level?: string,
        @Query('service') service?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ) {
        return this.gatewayService.getLogs('banckend_logs', level, service, parseInt(page), parseInt(pageSize));
    }

    @ApiTags('Debug')
    @Public()
    @Get('debug/logs/frontend')
    @BlockInProduction()
    @ApiOperation({
        summary: 'Get frontend logs',
        description:
            'Fetch frontend application logs with optional filtering. Only available in non-production environments.',
    })
    @ApiQuery({ name: 'level', required: false, description: 'Filter by log level', example: 'error' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: '1' })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Number of logs per page', example: '50' })
    @ApiResponse({ status: 200, description: 'Paginated frontend logs' })
    async getFrontendLogs(
        @Query('level') level?: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '50',
    ) {
        return this.gatewayService.getLogs('frontend_logs', level, undefined, parseInt(page), parseInt(pageSize));
    }

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
