import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.sub;
    if (!userId) {
      throw new Error('User ID is missing from the request.');
    }
    return userId;
  },
);
