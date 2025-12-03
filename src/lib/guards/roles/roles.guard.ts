import { role_str } from '@/lib/decorators/roles.decorator';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride(role_str, [
      context.getHandler(),
      context.getClass,
    ]);

    const user = context.switchToHttp().getRequest().user;

    const isAuthorized: boolean = roles.some((r: any) => user.role === r);

    if (!isAuthorized) {
      return false;
    }
    return true;
  }
}
