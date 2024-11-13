// src/auth/auth.module.ts
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthenticationGuard } from './guards/authentication.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from '../core/config/jwt.config';
import { RedisModule } from '../core/redis/redis.module';
import { MailModule } from '../mails/mail.module';
import { UsersModule } from '../users/user.module';
import { Role } from '../roles/entities/role.entity';
import { PassportModule } from '@nestjs/passport';
import googleOauthConfig from '../core/config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';
import { EmailJwtGuard } from './guards/email-jwt.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    JwtAuthGuard,
    AuthRepository,
    GoogleStrategy,
    EmailJwtGuard,
    GoogleAuthGuard,
  ],
  imports: [
    TypeOrmModule.forFeature([User, AuthRepository, Role]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
    forwardRef(() => UsersModule),
    RedisModule,
    MailModule,
    PassportModule,
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
