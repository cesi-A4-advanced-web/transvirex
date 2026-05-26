import { Controller, Get } from '@nestjs/common';
import { ToursService } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  getStatus() {
    return this.toursService.getStatus();
  }
}
