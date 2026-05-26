import { BillingService } from './billing.service';

describe('BillingService', () => {
  let billingService: BillingService;

  beforeEach(() => {
    billingService = new BillingService();
  });

  it('should expose the billing base status', () => {
    expect(billingService.getStatus()).toEqual({
      name: 'billing',
      description: 'Base billing microservice',
      status: 'ok',
    });
  });
});
