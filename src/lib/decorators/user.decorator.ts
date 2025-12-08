import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new HttpException('user not found ', HttpStatus.BAD_REQUEST);
    }
    return user;
  },
);
