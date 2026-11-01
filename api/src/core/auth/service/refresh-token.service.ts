import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Request } from 'express';

import { ApiCodeResponse } from '../../../common/api/data/enum/api-code-response.enum';
import { EnvService } from '../../../common/config/env.service';
import { AuthRefreshTokenEntity } from '../data/entity/auth-refresh-token.entity';
import { AuthSessionEntity } from '../data/entity/auth-session.entity';
import { AuthSecurityException } from '../data/exception/auth-security.exception';
import { AuthenticatedSession } from '../data/model/auth-context';
import { AuthCookieService } from './auth-cookie.service';
import { CsrfService } from './csrf.service';
import { AuthSessionService } from './auth-session.service';
import { TokenCryptoService } from './token-crypto.service';

type RotationResult = AuthenticatedSession | { replayDetected: true };

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tokenCrypto: TokenCryptoService,
    private readonly csrfService: CsrfService,
    private readonly sessions: AuthSessionService,
    private readonly cookies: AuthCookieService,
    private readonly envService: EnvService,
  ) {}

  async rotate(request: Request): Promise<AuthenticatedSession> {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const refreshToken = cookies?.[this.cookies.names.refresh];

    if (
      typeof refreshToken !== 'string' ||
      refreshToken.length < 40 ||
      refreshToken.length > 512
    ) {
      throw new AuthSecurityException('api.auth.refresh-invalid');
    }

    const csrfToken = request.header('X-CSRF-Token');

    if (!csrfToken) {
      throw new AuthSecurityException(
        ApiCodeResponse.AuthCsrfInvalid,
        HttpStatus.FORBIDDEN,
      );
    }

    const result: RotationResult = await this.dataSource.transaction(
      async (manager): Promise<RotationResult> => {
        const tokenRepository = manager.getRepository(AuthRefreshTokenEntity);
        const sessionRepository = manager.getRepository(AuthSessionEntity);
        const tokenHash = this.tokenCrypto.fingerprint(refreshToken);

        const candidate = await tokenRepository.findOneBy({ tokenHash });

        if (!candidate) {
          throw new AuthSecurityException('api.auth.refresh-invalid');
        }

        const session = await sessionRepository.findOne({
          where: { id: candidate.sessionId },
          lock: { mode: 'pessimistic_write' },
        });

        const token = await tokenRepository.findOne({
          where: { id: candidate.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!session || !token) {
          throw new AuthSecurityException('api.auth.refresh-invalid');
        }

        if (token.consumedAt !== null || token.revokedAt !== null) {
          await this.sessions.revoke(manager, session.id, 'refresh-reuse');

          return { replayDetected: true };
        }

        if (
          token.expiresAt <= new Date() ||
          session.expiresAt <= new Date() ||
          session.revokedAt !== null
        ) {
          throw new AuthSecurityException('api.auth.refresh-invalid');
        }

        this.csrfService.assertValid(request, session);

        const newRefreshToken = this.tokenCrypto.createOpaqueToken();
        const now = new Date();

        const refreshExpiresAt = new Date(
          Math.min(
            session.expiresAt.getTime(),
            now.getTime() + this.envService.refreshTokenTtlSeconds * 1000,
          ),
        );

        const replacement = await tokenRepository.save(
          tokenRepository.create({
            sessionId: session.id,
            tokenHash: this.tokenCrypto.fingerprint(newRefreshToken),
            expiresAt: refreshExpiresAt,
            consumedAt: null,
            revokedAt: null,
            replacedById: null,
            parentId: token.id,
          }),
        );

        token.consumedAt = now;
        token.replacedById = replacement.id;
        await tokenRepository.save(token);

        session.accessVersion += 1;
        session.lastUsedAt = now;
        await sessionRepository.save(session);

        return {
          accountId: session.accountId,
          sessionId: session.id,
          accessToken: this.tokenCrypto.signAccessToken(
            session.accountId,
            session.id,
            session.accessVersion,
          ),
          refreshToken: newRefreshToken,
          csrfToken,
          refreshExpiresAt,
        };
      },
    );

    if ('replayDetected' in result) {
      throw new AuthSecurityException('api.auth.refresh-invalid');
    }

    return result;
  }
}