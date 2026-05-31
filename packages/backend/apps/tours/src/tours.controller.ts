import { Controller, Get } from '@nestjs/common';
import { ToursService } from './tours.service';

@Controller()
export class ToursController {
    constructor(private readonly toursService: ToursService) {}

    @Get()
    getHello(): string {
        return this.toursService.getHello();
    }
}
