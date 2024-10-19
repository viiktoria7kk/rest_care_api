import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { resolve } from 'path';

const configService = new ConfigService();

config({ path: resolve(__dirname, '../../src/.env') });

export default registerAs('jwt', () => ({
  secret: configService.get<string>('JWT_SECRET'),
  audience: configService.get<string>('JWT_TOKEN_AUDIENCE'),
  issuer: configService.get<string>('JWT_TOKEN_ISSUER'),
  accessTokenTtl: parseInt(
    configService.get<string>('JWT_ACCESS_TOKEN_TTL', '3600'),
    10,
  ),
  refreshTokenTtl: parseInt(
    configService.get<string>('JWT_REFRESH_TOKEN_TTL', '86400'),
    10,
  ),
}));
