import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
  });

  it('should expose the users base status', () => {
    expect(usersService.getStatus()).toEqual({
      name: 'user-management',
      description: 'Base user management microservice',
      status: 'ok',
    });
  });
});
