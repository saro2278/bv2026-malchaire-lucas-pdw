import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { EnvService } from '../../../common/config/env.service';
import { AccountService } from '../../account/account.service';
import { AuthRefreshTokenEntity } from '../data/entity/auth-refresh-token.entity';
import { AuthSessionEntity } from '../data/entity/auth-session.entity';
import { AuthSecurityException } from '../data/exception/auth-security.exception';
import { AuthContext } from '../data/model/auth-context';
import { TokenCryptoService } from './token-crypto.service';

export type CreatedSession = {
  session: AuthSessionEntity;
  refreshToken: string;
  csrfToken: string;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthSessionService {
  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly sessionRepository: Repository<AuthSessionEntity>,
    private readonly accountService: AccountService,
    private readonly tokenCrypto: TokenCryptoService,
    private readonly envService: EnvService,
  ) {}

  async createSession(
    manager: EntityManager,
    accountId: string,
  ): Promise<CreatedSession> {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.envService.sessionAbsoluteTtlSeconds * 1000,
    );

    const csrfToken = this.tokenCrypto.createOpaqueToken();
    const refreshToken = this.tokenCrypto.createOpaqueToken();

    const sessionRepository = manager.getRepository(AuthSessionEntity);
    const refreshRepository = manager.getRepository(AuthRefreshTokenEntity);

    const session = await sessionRepository.save(
      sessionRepository.create({
        accountId,
        accessVersion: 1,
        csrfTokenHash: this.tokenCrypto.fingerprint(csrfToken),
        lastUsedAt: now,
        expiresAt,
        revokedAt: null,
        revocationReason: null,
      }),
    );

    const refreshExpiresAt = new Date(
      Math.min(
        expiresAt.getTime(),
        now.getTime() + this.envService.refreshTokenTtlSeconds * 1000,
      ),
    );

    await refreshRepository.save(
      refreshRepository.create({
        sessionId: session.id,
        tokenHash: this.tokenCrypto.fingerprint(refreshToken),
        expiresAt: refreshExpiresAt,
        consumedAt: null,
        revokedAt: null,
        replacedById: null,
        parentId: null,
      }),
    );

    return {
      session,
      refreshToken,
      csrfToken,
      refreshExpiresAt,
    };
  }

  async verifyContext(context: AuthContext): Promise<AuthSessionEntity> {
    const session = await this.sessionRepository.findOneBy({
      id: context.sessionId,
    });

    if (
      !session ||
      session.accountId !== context.accountId ||
      session.revokedAt !== null ||
      session.expiresAt <= new Date()
    ) {
      throw new AuthSecurityException();
    }

    const account = await this.accountService.findById(context.accountId);

    if (!account || !this.accountService.canAuthenticate(account)) {
      throw new AuthSecurityException();
    }

    return session;
  }

  async revoke(
    manager: EntityManager,
    sessionId: string,
    reason: string,
  ): Promise<void> {
    const sessionRepository = manager.getRepository(AuthSessionEntity);
    const refreshRepository = manager.getRepository(AuthRefreshTokenEntity);

    await sessionRepository.update(sessionId, {
      revokedAt: new Date(),
      revocationReason: reason,
      accessVersion: () => 'access_version + 1',
    });

    await refreshRepository
      .createQueryBuilder()
      .update(AuthRefreshTokenEntity)
      .set({ revokedAt: new Date() })
      .where('session_id = :sessionId', { sessionId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }
}