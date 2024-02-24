import { ExecutionContext } from '@nestjs/common';
import { GetUser } from './user.decorator';

describe('UserDecorator', () => {
  const ctx: ExecutionContext = {
    getType: jest.fn(),
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };

  it('should extract user from request', () => {
    const mockUser = { id: 1, name: 'test' };

    const request: Express.Request = {
      user: mockUser,
      isAuthenticated: jest.fn().mockReturnValue(true),
      isUnauthenticated: jest.fn().mockReturnValue(false),
      login: jest.fn(),
      logIn: jest.fn(),
      logOut: jest.fn(),
      logout: jest.fn(),
    };

    jest.spyOn(ctx, 'switchToHttp').mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    } as unknown as any);

    const result = GetUser(null, ctx);

    expect(result).toEqual(mockUser);
  });

  it('should extract user property from request', () => {
    const mockUser = { id: 1, name: 'test' };

    const request: Express.Request = {
      user: mockUser,
      isAuthenticated: jest.fn().mockReturnValue(true),
      isUnauthenticated: jest.fn().mockReturnValue(false),
      login: jest.fn(),
      logIn: jest.fn(),
      logOut: jest.fn(),
      logout: jest.fn(),
    };

    jest.spyOn(ctx, 'switchToHttp').mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    } as unknown as any);

    const result = GetUser('id', ctx);

    expect(result).toEqual(mockUser.id);
  });
});
