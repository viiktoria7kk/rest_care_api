import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { PasswordDto } from './password.dto';

export class SignInDto extends PasswordDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
