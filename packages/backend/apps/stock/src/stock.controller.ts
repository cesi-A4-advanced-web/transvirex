import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StockService } from './stock.service';

@Controller()
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'stock' }
    }
}
