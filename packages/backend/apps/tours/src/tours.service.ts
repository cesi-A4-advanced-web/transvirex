import { Injectable } from '@nestjs/common';

@Injectable()
export class ToursService {
    getHello(): string {
        return 'Hello World!';
    }
}
