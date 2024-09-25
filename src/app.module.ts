import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './core/config/jwt.config';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './core/redis/redis.module';
import { MailModule } from './mails/mail.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permission.module';
import { FileModule } from './files/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    UsersModule,
    AuthModule,
    RedisModule,
    MailModule,
    RolesModule,
    PermissionsModule,
    FileModule,
  ],
})
export class AppModule {}
