import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class AuthRepository {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async updateTokens(
    userId: number,
    tokens: { accessToken: string; refreshToken: string },
  ): Promise<boolean> {
    await this.redis.del(userId.toString());
    await this.redis.set(userId.toString(), JSON.stringify(tokens));
    return true;
  }

  async getTokens(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    const tokensString = await this.redis.get(userId.toString());
    return tokensString ? JSON.parse(tokensString) : null;
  }

  async deleteTokens(userId: number): Promise<boolean> {
    await this.redis.del(userId.toString());
    return true;
  }

  async saveTokenWithEmail(email: string, token: string): Promise<boolean> {
    await this.redis.set(email, token, 'EX', 60 * 60 * 24);
    return true;
  }

  async getTokenWithEmail(email: string): Promise<string | null> {
    return this.redis.get(email);
  }

  async getResetPasswordToken(email: string): Promise<string | null> {
    return this.redis.get(email);
  }
}
