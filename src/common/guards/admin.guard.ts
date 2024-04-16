import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_KEY } from '../decorators/is-admin.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If the route does not require admin access, allow access for everyone
    if (!isAdminOnly) {
      return true;
    }

    // Otherwise, check if the user is an admin
    const { user } = context.switchToHttp().getRequest();
    return user && user.isAdmin;
  }
}
