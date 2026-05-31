import { Test, TestingModule } from '@nestjs/testing';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';

describe('ToursController', () => {
    let toursController: ToursController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [ToursController],
            providers: [ToursService],
        }).compile();

        toursController = app.get<ToursController>(ToursController);
    });

    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(toursController.getHello()).toBe('Hello World!');
        });
    });
});
