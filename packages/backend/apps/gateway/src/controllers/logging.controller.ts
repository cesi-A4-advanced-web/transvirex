import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../libs/guards/src/public.decorator';
import { LogFrontendDto } from '../dto/log-frontend.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class LoggingController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Logging')
    @Public()
    @Post('logs/frontend')
    @ApiOperation({
        summary: 'Ingest frontend log',
        description: 'Send a log entry from the frontend application.',
    })
    @ApiBody({ type: LogFrontendDto })
    @ApiResponse({ status: 201, description: 'Log entry created' })
    async logFromFrontend(@Body() body: LogFrontendDto) {
        return this.gatewayService.logFromFrontend(body);
    }
}
