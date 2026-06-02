import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ToursService } from './tours.service';

@Controller()
export class ToursController {
    constructor(private readonly toursService: ToursService) {}

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'tours' }
    }
}
