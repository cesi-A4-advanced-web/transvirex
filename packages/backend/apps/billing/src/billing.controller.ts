import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { BillingService } from './billing.service';

/** HTTP and RabbitMQ controller for billing operations. */
@Controller()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    /** HTTP health-check endpoint. */
    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'billing' };
    }

    @Get('billing')
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.billingService.findAll(page, limit);
    }

    @Get('billing/:id')
    findById(@Param('id') id: string) {
        return this.billingService.findById(id);
    }

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'billing' };
    }
}
