import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  beforeEach(() => {
    authenticationService = new AuthenticationService();
  });

  it('should expose the authentication base status', () => {
    expect(authenticationService.getStatus()).toEqual({
      name: 'authentication',
      description: 'Base authentication microservice',
      status: 'ok',
    });
  });
});
