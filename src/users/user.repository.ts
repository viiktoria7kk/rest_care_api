import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  private readonly logger = new Logger(UserRepository.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserWithPermissions(id: number): Promise<User> {
    try {
      return await this.findOneOrFail({
        where: { id },
        relations: ['roles'],
        join: {
          alias: 'user',
          leftJoinAndSelect: {
            roles: 'user.roles',
            permissions: 'roles.permissions',
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find user permissions by ID ${id}`,
        error.stack,
      );
      throw new BadRequestException('User not found');
    }
  }
}
