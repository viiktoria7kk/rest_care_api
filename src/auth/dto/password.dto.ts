import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ description: 'Password of the user' })
  @Matches(/.*[!@#$%^&*(),.?":{}|<>].*/, {
    message: 'Password must contain at least one special character',
  })
  @Matches(/.*[A-Z].*/, {
    message: 'Password must contain at least one uppercase letter',
  })
  password: string;
}
