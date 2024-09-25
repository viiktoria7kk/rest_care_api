import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({ description: 'Email of the user' })
  email: string;
}
