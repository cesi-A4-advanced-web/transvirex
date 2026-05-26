import { ToursService } from './tours.service';

describe('ToursService', () => {
  let toursService: ToursService;

  beforeEach(() => {
    toursService = new ToursService();
  });

  it('should expose the tours base status', () => {
    expect(toursService.getStatus()).toEqual({
      name: 'tour-planning',
      description: 'Base tour planning microservice',
      status: 'ok',
    });
  });
});
