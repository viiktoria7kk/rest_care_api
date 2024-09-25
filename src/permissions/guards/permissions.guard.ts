import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const hasPermission = requiredPermissions.every((permission) =>
      request.user.permissions.includes(permission),
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
