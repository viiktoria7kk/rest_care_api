import {
  BadRequestException,
  Injectable,
  Inject,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import jwtConfig from '../core/config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { HashingService } from './hashing/hashing.service';
import { TokensInterface } from './interfaces/token.interface';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../mails/mail.service';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hachingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<string> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: signUpDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email is already in use.');
      }
      const role = await this.rolesRepository.findOne({
        where: { name: 'user' },
      });

      const user = new User();
      user.email = signUpDto.email;
      user.password = await this.hachingService.hash(signUpDto.password);
      user.roles = [role];

      await this.userRepository.save(user);
      return `User with email ${user.email} has been created successfully.`;
    } catch (error) {
      this.logger.error('Error during sign-up process', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  async signIn(signInDto: SignInDto): Promise<TokensInterface> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: signInDto.email },
      });
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      const isPasswordValid = await this.hachingService.compare(
        signInDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password.');
      }
      const tokens = await this.generateToken(user);
      await this.authRepository.updateTokens(user.id, tokens);

      return tokens;
    } catch (error) {
      this.logger.error('Error during sign-in process', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid login credentials.');
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

  async updateUserPassword(
    user_id: number,
    password: UpdatePasswordDto,
  ): Promise<string> {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id: user_id },
      });
      user.password = await this.hachingService.hash(password.repeatPassword);
      await this.userRepository.save(user);
      return `User with id ${user_id} password has been updated`;
    } catch (error) {
      this.logger.error('Error during password update process', error.stack);
      if (error.status === 404) throw error;
      throw new InternalServerErrorException(
        `Failed to update user password by ID ${user_id}`,
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: forgotPasswordDto.email },
      });
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      const tokenExpiration = parseInt(
        this.configService.get<string>('RESET_PASSWORD_TOKEN_EXPIRATION'),
        10,
      );
      const emailSubject = this.configService.get<string>(
        'RESET_PASSWORD_EMAIL_SUBJECT',
      );
      const token = await this.signToken(user.id, tokenExpiration);
      await this.authRepository.deleteTokens(user.id);
      this.logger.log('Generated reset password token', token);
      await this.authRepository.addResetPasswordToken(user.email, token);
      this.logger.log('Added reset password token for user', user.email);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const link = `${frontendUrl}/reset-password/${token}`;
      console.log(link);
      await this.emailService.sendEmail({
        to: user.email,
        subject: emailSubject,
        template: 'reset-password',
        context: {
          link,
        },
      });

      return 'Reset password email sent.';
    } catch (error) {
      this.logger.error('Error during forgot password process', error.stack);
      throw new NotFoundException(
        `User with email ${forgotPasswordDto.email} not found.`,
      );
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
  ): Promise<string> {
    try {
      if (resetPasswordDto.password !== resetPasswordDto.repeatPassword) {
        throw new BadRequestException('Passwords do not match.');
      }

      const decodedToken = this.jwtService.verify(token, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.userRepository.findOne({
        where: { id: decodedToken.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found.');
      }

      const resetPassToken = await this.authRepository.getResetPasswordToken(
        user.email,
      );

      if (!resetPassToken || resetPassToken !== token) {
        throw new UnauthorizedException(
          'Invalid or expired reset password token.',
        );
      }

      user.password = await this.hachingService.hash(resetPasswordDto.password);
      await this.userRepository.save(user);

      await this.authRepository.deleteResetPasswordToken(user.email);

      return 'Password has been successfully reset.';
    } catch (error) {
      this.logger.error('Error during password reset process', error.stack);
      if (
        error instanceof JsonWebTokenError ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'An error occurred during the password reset process.',
      );
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

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
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
