import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthResponseDto } from './data/dto/auth-response.dto';
import { LoginRequestDto } from './data/dto/login-request.dto';
import { RegisterRequestDto } from './data/dto/register-request.dto';
import type { AuthContext } from './data/model/auth-context';
import { CurrentAuth } from './decorator/current-auth.decorator';
import { Public } from './decorator/public.decorator';
import { AuthService } from './service/auth.service';
import { AuthCookieService } from './service/auth-cookie.service';
import { RefreshTokenService } from './service/refresh-token.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() body: RegisterRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.register(body.email, body.password);
    this.setCookies(response, session);

    return {
      accountId: session.accountId,
      csrfToken: session.csrfToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.authService.login(body.email, body.password);
    this.setCookies(response, session);

    return {
      accountId: session.accountId,
      csrfToken: session.csrfToken,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.refreshTokens.rotate(request);
    this.setCookies(response, session);

    return {
      accountId: session.accountId,
      csrfToken: session.csrfToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentAuth() auth: AuthContext,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    await this.authService.logout(auth, request);
    this.cookies.clearCookies(response);

    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentAuth() auth: AuthContext,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    await this.authService.logoutAll(auth, request);
    this.cookies.clearCookies(response);

    return { success: true };
  }

  private setCookies(
    response: Response,
    session: {
      accessToken: string;
      refreshToken: string;
      csrfToken: string;
      refreshExpiresAt: Date;
    },
  ): void {
    this.cookies.setAccessCookie(response, session.accessToken);
    this.cookies.setRefreshCookie(
      response,
      session.refreshToken,
      session.refreshExpiresAt,
    );
    this.cookies.setCsrfCookie(
      response,
      session.csrfToken,
      session.refreshExpiresAt,
    );
  }
}