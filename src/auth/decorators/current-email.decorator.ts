import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const email = request.user?.email;
    if (!email) {
      throw new Error('Email is missing from the request.');
    }
    return email;
  },
);
