import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserRepository)
    private readonly usersRepository: UserRepository,
  ) {}

  async getUserByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error(`Failed to get user by email: ${email}`, error.stack);
      throw new NotFoundException('User not found');
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error('Failed to create user', error.stack);
      throw new NotFoundException('Failed to create user');
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      return await this.usersRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to get user by ID: ${id}`, error.stack);
      throw new NotFoundException('User not found');
    }
  }

  async deleteUserById(id: number): Promise<string> {
    try {
      await this.usersRepository.delete(id);
      return 'User deleted successfully';
    } catch (error) {
      this.logger.error(`Failed to delete user by ID: ${id}`, error.stack);
      throw new NotFoundException('User not found');
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.usersRepository.update(id, updateUserDto);
      return await this.usersRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to update user by ID: ${id}`, error.stack);
      throw new NotFoundException('User not found');
    }
  }

  async updateAvatar(userId: number, avatarPath: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = avatarPath;
    return this.usersRepository.save(user);
  }

  async getUserOrCreate(userDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.getUserByEmail(userDto.email);
      if (user) return user;
      return this.createUser(userDto);
    } catch (error) {
      this.logger.error('Error retrieving or creating user', error.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve or create user.',
      );
    }
  }
}
