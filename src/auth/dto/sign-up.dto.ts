import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { PasswordDto } from './password.dto';

export class SignUpDto extends PasswordDto {
  @ApiProperty({ description: 'Email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
