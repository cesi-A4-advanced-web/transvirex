import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

describe('BillingController', () => {
    let billingController: BillingController;
    let billingService: BillingService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [BillingController],
            providers: [
                {
                    provide: BillingService,
                    useValue: { findById: jest.fn(), findAll: jest.fn() },
                },
            ],
        }).compile();

        billingController = app.get<BillingController>(BillingController);
        billingService = app.get<BillingService>(BillingService);
    });

    describe('findById', () => {
        it('should return an invoice', async () => {
            const invoice = { id: 'invoice-id', reference: 'INV-001' };
            jest.spyOn(billingService, 'findById').mockResolvedValue(
                invoice as never,
            );

            await expect(
                billingController.findById('invoice-id'),
            ).resolves.toEqual(invoice);
            expect(billingService.findById).toHaveBeenCalledWith('invoice-id');
        });
    });

    describe('findAll', () => {
        it('should return paginated invoices', async () => {
            const result = {
                data: [{ id: 'invoice-id', reference: 'INV-001' }],
                page: 1,
                limit: 10,
                total: 1,
            };
            jest.spyOn(billingService, 'findAll').mockResolvedValue(
                result as never,
            );
            await expect(billingController.findAll(1, 10)).resolves.toEqual(
                result,
            );
            expect(billingService.findAll).toHaveBeenCalledWith(1, 10);
        });
    });
});
