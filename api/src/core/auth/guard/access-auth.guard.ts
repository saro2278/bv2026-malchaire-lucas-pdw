import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { AuthCookieService } from '../service/auth-cookie.service';
import { AuthSessionService } from '../service/auth-session.service';
import { TokenCryptoService } from '../service/token-crypto.service';
import { AuthContext } from '../data/model/auth-context';
import { AuthSecurityException } from '../data/exception/auth-security.exception';
import { PUBLIC_ROUTE } from '../decorator/public.decorator';

type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cookies: AuthCookieService,
    private readonly tokenCrypto: TokenCryptoService,
    private readonly sessions: AuthSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const requestCookies = request.cookies as
      | Record<string, unknown>
      | undefined;
    const accessToken = requestCookies?.[this.cookies.names.access];

    if (typeof accessToken !== 'string') {
      throw new AuthSecurityException();
    }

    const claims = this.tokenCrypto.verifyAccessToken(accessToken);

    const auth: AuthContext = {
      accountId: claims.sub,
      sessionId: claims.sid,
      tokenId: claims.jti,
    };

    const session = await this.sessions.verifyContext(auth);

    if (session.accessVersion !== claims.ver) {
      throw new AuthSecurityException();
    }

    request.auth = auth;
    return true;
  }
}