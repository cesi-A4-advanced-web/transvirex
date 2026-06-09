import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';

/** HTTP and RabbitMQ controller for delivery operations. */
@Controller()
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) {}

    /** HTTP health-check endpoint. */
    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'delivery' };
    }

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'delivery' };
    }
}
