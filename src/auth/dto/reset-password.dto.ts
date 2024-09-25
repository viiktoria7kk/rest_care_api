import { IsString, MinLength } from 'class-validator';
import { PasswordDto } from './password.dto';

export class ResetPasswordDto extends PasswordDto {
  @IsString()
  @MinLength(6)
  repeatPassword: string;
}
