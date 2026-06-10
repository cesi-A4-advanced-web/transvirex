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
                    useValue: {
                        findById: jest.fn(),
                        findAll: jest.fn(),
                        create: jest.fn(),
                    },
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

    describe('create', () => {
        it('should create an invoice', async () => {
            const body = {
                customer_id: 'customer-id',
                hub_id: 'hub-id',
                pickup_address_id: 'pickup-id',
                delivery_address_id: 'delivery-id',
                business_manager_id: 'manager-id',
                reference: 'INV-999',
                priority: 'standard',
                due_date: '2026-12-31T00:00:00.000Z',
            };
            const invoice = { id: 'invoice-id', ...body };
            jest.spyOn(billingService, 'create').mockResolvedValue(
                invoice as never,
            );

            await expect(billingController.create(body as never)).resolves.toEqual(
                invoice,
            );
            expect(billingService.create).toHaveBeenCalledWith(body);
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
