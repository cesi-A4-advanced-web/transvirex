import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GatewayService } from '../gateway.service';

@Controller('ai')
export class AiController {
    constructor(private readonly gatewayService: GatewayService) {}

    @Post('chat')
    chat(@Body() body: { message: string; history?: Array<{ role: string; content: string }> }) {
        return this.gatewayService.aiPost('chat', body);
    }

    /** Unified endpoint: detects intent (incident vs chat) and routes accordingly. */
    @Post('process')
    process(@Body() body: { text: string; driver_id: string; delivery_id?: string }) {
        return this.gatewayService.aiPost('process', body);
    }

    @Post('incidents')
    declareIncident(@Body() body: { text: string; driver_id: string; delivery_id: string }) {
        return this.gatewayService.aiPost('incidents', body);
    }

    @Get('incidents/:deliveryId')
    getIncidents(@Param('deliveryId') deliveryId: string) {
        return this.gatewayService.aiGet(`incidents/${deliveryId}`);
    }

    @Post('knowledge')
    ingestKnowledge(@Body() body: { content: string; metadata?: Record<string, unknown> }) {
        return this.gatewayService.aiPost('knowledge', body);
    }

    @Get('notifications')
    getNotifications(@Query('unread_only') unreadOnly?: string) {
        const qs = unreadOnly === 'true' ? '?unread_only=true' : '';
        return this.gatewayService.aiGet(`notifications${qs}`);
    }

    @Post('notifications/:id/read')
    markRead(@Param('id') id: string) {
        return this.gatewayService.aiPost(`notifications/${id}/read`, {});
    }
}
