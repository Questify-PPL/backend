import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  it('canActivate should return true if roles are not defined', () => {
    const reflector = {
      get: jest.fn().mockReturnValue(undefined),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as Reflector;

    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.ADMIN },
        }),
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ExecutionContext;

    const rolesGuard = new RolesGuard(reflector);

    expect(rolesGuard.canActivate(context)).toBe(true);
  });

  it('canActivate should return false if all role does not match', () => {
    const reflector = {
      get: jest.fn().mockReturnValue(['CREATOR']),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as Reflector;

    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.RESPONDENT },
        }),
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ExecutionContext;

    const rolesGuard = new RolesGuard(reflector);
    expect(rolesGuard.canActivate(context)).toBe(false);
  });

  it('canActivate should return true if the role matches', () => {
    const reflector = {
      get: jest.fn().mockReturnValue(['ADMIN']),
      getAll: jest.fn(),
      getAllAndMerge: jest.fn(),
      getAllAndOverride: jest.fn(),
    } as Reflector;

    const context = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: Role.ADMIN },
        }),
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as ExecutionContext;

    const rolesGuard = new RolesGuard(reflector);
    expect(rolesGuard.canActivate(context)).toBe(true);
  });
});
