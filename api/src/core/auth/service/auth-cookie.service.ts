import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';

import { EnvService } from '../../../common/config/env.service';

type AuthCookieNames = {
  access: string;
  refresh: string;
  csrf: string;
};

@Injectable()
export class AuthCookieService {
  readonly names: AuthCookieNames;

  constructor(private readonly envService: EnvService) {
    this.names = this.envService.isProduction
      ? {
          access: '__Host-hoos-access',
          refresh: '__Host-hoos-refresh',
          csrf: '__Host-hoos-csrf',
        }
      : {
          access: 'hoos-access',
          refresh: 'hoos-refresh',
          csrf: 'hoos-csrf',
        };
  }

  setAccessCookie(response: Response, token: string): void {
    response.cookie(this.names.access, token, {
      ...this.baseOptions(true),
      maxAge: this.envService.accessTokenTtlSeconds * 1000,
    });
  }

  setRefreshCookie(
    response: Response,
    token: string,
    expiresAt: Date,
  ): void {
    response.cookie(this.names.refresh, token, {
      ...this.baseOptions(true),
      maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
    });
  }

  setCsrfCookie(response: Response, token: string, expiresAt: Date): void {
    response.cookie(this.names.csrf, token, {
      ...this.baseOptions(false),
      maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
    });
  }

  clearCookies(response: Response): void {
    response.clearCookie(this.names.access, this.baseOptions(true));
    response.clearCookie(this.names.refresh, this.baseOptions(true));
    response.clearCookie(this.names.csrf, this.baseOptions(false));
  }

  private baseOptions(httpOnly: boolean): CookieOptions {
    return {
      httpOnly,
      secure: this.envService.isProduction,
      sameSite: 'strict',
      path: '/',
    };
  }
}