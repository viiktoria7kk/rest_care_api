import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { EmailDto } from './dto/email.dto';
import { CurrentEmail } from './decorators/current-email.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Auth(AuthType.None)
  @Post('send-auth-email')
  @ApiOperation({ summary: 'Send authentication email' })
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 201,
    description: `Sign-in link has been sent to your email. Please check your email. OR: Sign-up link has been sent to your email. Please check your email.`,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async sendAuthEmail(@Body() emailDto: EmailDto): Promise<string> {
    return await this.authService.sendAuthEmail(emailDto);
  }

  @Auth(AuthType.BearerEmailConfirmation)
  @Post('sign-up')
  @ApiOperation({ summary: 'Confirm user email' })
  @ApiResponse({
    status: 200,
    description: 'Email has been successfully confirmed.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired confirmation link.',
  })
  async signUpWithEmail(
    @CurrentEmail() email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.SignUpWithEmail(email);
  }

  @Auth(AuthType.BearerEmailConfirmation)
  @Post('sign-in')
  @ApiOperation({ summary: 'Confirm user email' })
  @ApiResponse({
    status: 200,
    description: 'Email has been successfully confirmed.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired confirmation link.',
  })
  async SignInWithEmail(
    @CurrentEmail() email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await this.authService.SignInWithEmail(email);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh-token')
  @ApiResponse({
    status: 200,
    description: 'Token has been successfully refreshed.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshToken(
    @CurrentUser() user_id: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
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

  @Auth(AuthType.Google)
  @Get('google/login')
  @ApiOperation({ summary: 'Google login' })
  googleLogin() {}

  @Auth(AuthType.Google)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google callback' })
  async googleCallback(@Req() req, @Res() res) {
    const tokens = await this.authService.googleLogin(req.user.id);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(
      `${frontendUrl}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
