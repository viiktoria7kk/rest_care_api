import { Module } from '@nestjs/common';
import {
  RedisModule as NestRedisModule,
  RedisModuleOptions,
} from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
    }),
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
