import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import jwtConfig from '../../core/config/jwt.config';
import { AuthRepository } from '../auth.repository';
import { REQUEST_USER_KEY } from '../constansts/request-user-key.constant';
import { UserRepository } from '../../users/user.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly authRepository: AuthRepository,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      const user = await this.userRepository.findUserWithPermissions(
        payload.sub,
      );
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const resetPasswordToken =
        await this.authRepository.getResetPasswordToken(user.email);

      const storedTokens = await this.authRepository.getTokens(payload.sub);
      if (
        (!storedTokens || storedTokens.accessToken !== token) &&
        resetPasswordToken !== token
      ) {
        throw new UnauthorizedException('Invalid token');
      }

      request[REQUEST_USER_KEY] = {
        sub: user.id,
        ...user,
        role: user.roles,
        permissions: user.roles.flatMap((role) =>
          role.permissions.map((permission) => permission.name),
        ),
      };
      return true;
    } catch (error) {
      console.error(error);

      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
