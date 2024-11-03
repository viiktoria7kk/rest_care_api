import {
  BadRequestException,
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import jwtConfig from '../core/config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { TokensInterface } from './interfaces/token.interface';
import { EmailService } from '../mails/mail.service';
import { Role } from '../roles/entities/role.entity';
import { EmailDto } from './dto/email.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {}

  async googleLogin(userId: number): Promise<TokensInterface> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: userId },
      });
      return await this.updateUserTokens(user);
    } catch (error) {
      this.logger.error('Error during Google login', error.stack);
      throw new InternalServerErrorException('Failed to login with Google.');
    }
  }

  async SignUpWithEmail(email: string): Promise<TokensInterface> {
    try {
      const role = await this.rolesRepository.findOne({
        where: { name: 'user' },
      });

      const user = new User();
      user.email = email;
      user.roles = [role];
      await this.userRepository.save(user);

      return await this.updateUserTokens(user);
    } catch (error) {
      this.logger.error('Error during email confirmation', error.stack);
      throw new InternalServerErrorException('Failed to confirm email.');
    }
  }

  private async updateUserTokens(user: User): Promise<TokensInterface> {
    const tokens = await this.generateToken(user);
    await this.authRepository.updateTokens(user.id, tokens);
    return tokens;
  }

  async sendAuthEmail(emailDto: EmailDto): Promise<string> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: emailDto.email },
      });

      const template = existingUser ? 'confirm-email-sign-in' : 'confirm-email';
      const signIn = !!existingUser;

      await this.sendConfirmEmailLink(emailDto.email, template, signIn);

      return existingUser
        ? 'Sign-in link has been sent to your email. Please check your email.'
        : 'Sign-up link has been sent to your email. Please check your email.';
    } catch (error) {
      this.logger.error('Error during sign-up process', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to sign up user.');
    }
  }

  private async sendConfirmEmailLink(
    email: string,
    template: string,
    signIn: boolean,
  ): Promise<boolean> {
    try {
      const payload = { email };
      const token = await this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.secret,
        expiresIn: '5m',
      });
      await this.authRepository.saveTokenWithEmail(email, token);

      const baseUrl = this.configService.get<string>('FRONTEND_URL');
      const confirmLink = `${baseUrl}/confirm-email${signIn ? '-sign-in' : ''}?token=${token}`;

      await this.emailService.sendEmail({
        to: email,
        subject: 'Confirm your email',
        template: template,
        context: {
          confirmLink,
        },
      });
      return true;
    } catch (error) {
      this.logger.error('Error sending confirmation email link', error.stack);
      throw new InternalServerErrorException(
        'Failed to send confirmation email link.',
      );
    }
  }

  async SignInWithEmail(email: string): Promise<TokensInterface> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { email },
      });
      return await this.updateUserTokens(user);
    } catch (error) {
      this.logger.error('Error during sign-in confirmation', error.stack);
      throw new InternalServerErrorException('Failed to confirm sign-in.');
    }
  }

  async refreshToken(user_id: number): Promise<TokensInterface> {
    try {
      const storedTokens = await this.authRepository.getTokens(user_id);
      if (!storedTokens) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const user = await this.userRepository.findOneOrFail({
        where: { id: user_id },
      });

      const newTokens = await this.generateToken(user);
      await this.authRepository.updateTokens(user.id, newTokens);
      return newTokens;
    } catch (error) {
      this.logger.error('Error during token refresh process', error.stack);
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async logout(user_id: number): Promise<string> {
    try {
      await this.authRepository.deleteTokens(user_id);
      return 'User has been successfully logged out.';
    } catch (error) {
      this.logger.error('Error during logout process', error.stack);
      throw new BadRequestException('Failed to log out. Please try again.');
    }
  }

  private async generateToken(user: User): Promise<TokensInterface> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.signToken<Partial<{ email: string }>>(
          user.id,
          this.jwtConfiguration.accessTokenTtl,
          { email: user.email },
        ),
        this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Error generating tokens', error.stack);
      throw new InternalServerErrorException('Failed to generate tokens.');
    }
  }

  private async signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    try {
      const token = await this.jwtService.signAsync(
        {
          sub: userId,
          ...payload,
        },
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          expiresIn,
          secret: this.jwtConfiguration.secret,
        },
      );
      return token;
    } catch (error) {
      this.logger.error('Error signing token', error.stack);
      throw new InternalServerErrorException('Failed to sign token.');
    }
  }
}
