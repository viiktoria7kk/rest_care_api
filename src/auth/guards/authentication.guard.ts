import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { EmailJwtGuard } from './email-jwt.guard';
import { Reflector } from '@nestjs/core';
import { AuthType } from '../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { GoogleAuthGuard } from './google-auth.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<AuthType, CanActivate> = {
    [AuthType.Bearer]: this.jwtAuthGuard,
    [AuthType.BearerEmailConfirmation]: this.emailJwtGuard,
    [AuthType.Google]: this.googleAuthGuard,
    [AuthType.None]: { canActivate: () => true } as CanActivate,
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly emailJwtGuard: EmailJwtGuard,
    private readonly googleAuthGuard: GoogleAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    for (const type of authTypes) {
      const guard = this.authTypeGuardMap[type];
      if (await guard.canActivate(context)) {
        return true;
      }
    }

    throw new UnauthorizedException();
  }
}
