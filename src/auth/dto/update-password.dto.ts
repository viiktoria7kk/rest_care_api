import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../decorators/match.decorator';

export class UpdatePasswordDto {
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

  @ApiProperty({ description: 'Repeat new password to be set for the user' })
  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  repeatPassword: string;
}
