import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../core/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UsersController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    forwardRef(() => AuthModule),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  controllers: [UsersController],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
