import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';

@Controller()
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) {}

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'delivery' }
    }
}
