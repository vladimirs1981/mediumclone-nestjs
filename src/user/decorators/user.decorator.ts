import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  //get request from ExecutionContext
  const request = ctx.switchToHttp().getRequest();

  //if there is no user in the request return null
  if (!request.user) {
    return null;
  }

  //there is some value we get from request
  if (data) {
    return request.user[data];
  }
  return request.user;
});
