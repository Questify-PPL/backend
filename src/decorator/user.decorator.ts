import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = (data: unknown, ctx: ExecutionContext) => {
  const request: Express.Request = ctx.switchToHttp().getRequest();

  if (data && request.user) return request.user[data as keyof User];
  return request.user;
};

export const CurrentUser = createParamDecorator(GetUser);
