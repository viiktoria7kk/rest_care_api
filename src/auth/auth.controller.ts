import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { TokensInterface } from './interfaces/token.interface';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';
import { Permissions } from '../permissions/decorators/permissions.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(AuthType.None)
  @Post('sign-up')
  @ApiResponse({
    status: 201,
    description: 'User has been successfully signed up.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async signUp(@Body() signUpDto: SignUpDto): Promise<string> {
    return await this.authService.signUp(signUpDto);
  }

  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Sign in a user' })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @ApiResponse({
    status: 200,
    description: 'User has been successfully signed in.',
    example: {
      accessToken: 'string',
      refreshToken: 'string',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: SignInDto })
  async signIn(@Body() signInDto: SignInDto): Promise<TokensInterface> {
    return await this.authService.signIn(signInDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh-token')
  @ApiResponse({
    status: 200,
    description: 'Token has been successfully refreshed.',
    example: {
      accessToken: 'string',
      refreshToken: 'string',
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshToken(@CurrentUser() user_id: number): Promise<TokensInterface> {
    return await this.authService.refreshToken(user_id);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout a user' })
  @Post('logout')
  @ApiResponse({
    status: 200,
    description: 'User has been successfully logged out.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@CurrentUser() user_id: number): Promise<string> {
    return await this.authService.logout(user_id);
  }

  @Auth(AuthType.None)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset password email sent.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Auth(AuthType.None)
  @Post('reset-password/:token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'Password has been successfully reset.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'newPassword123' },
        repeatPassword: { type: 'string', example: 'newPassword123' },
      },
    },
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('token') token: string,
  ): Promise<string> {
    return await this.authService.resetPassword(resetPasswordDto, token);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('update_user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user password' })
  @Post('update-password')
  @ApiResponse({
    status: 200,
    description: 'User password has been successfully updated.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async updateUserPassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user_id: number,
  ): Promise<string> {
    return await this.authService.updateUserPassword(
      user_id,
      updatePasswordDto,
    );
  }
}
