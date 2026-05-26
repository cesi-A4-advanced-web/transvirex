import { StockService } from './stock.service';

describe('StockService', () => {
  let stockService: StockService;

  beforeEach(() => {
    stockService = new StockService();
  });

  it('should expose the stock base status', () => {
    expect(stockService.getStatus()).toEqual({
      name: 'stock-management',
      description: 'Base stock management microservice',
      status: 'ok',
    });
  });
});
