import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import type { Request } from 'express';

import { ApiCodeResponse } from '../../../common/api/data/enum/api-code-response.enum';
import { ApiException } from '../../../common/api/data/exception/api-exception';
import { AccountEntity } from '../../account/data/entity/account.entity';
import { AccountService } from '../../account/account.service';
import { AuthSessionEntity } from '../data/entity/auth-session.entity';
import type {
  AuthContext,
  AuthenticatedSession,
} from '../data/model/auth-context';
import { AuthSecurityException } from '../data/exception/auth-security.exception';
import { AuthIdentifierService } from './auth-identifier.service';
import { AuthSessionService } from './auth-session.service';
import { CsrfService } from './csrf.service';
import { PasswordCredentialService } from './password-credential.service';
import { PasswordHasherService } from './password-hasher.service';
import { PasswordPolicyService } from './password-policy.service';
import { TokenCryptoService } from './token-crypto.service';
import { normalizeEmail } from '../utils/normalize-email.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accountService: AccountService,
    private readonly identifiers: AuthIdentifierService,
    private readonly passwordCredentials: PasswordCredentialService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly passwordPolicy: PasswordPolicyService,
    private readonly sessions: AuthSessionService,
    private readonly csrfService: CsrfService,
    private readonly tokenCrypto: TokenCryptoService,
  ) {}

  async register(
    email: string,
    password: string,
  ): Promise<AuthenticatedSession> {
    const normalizedEmail = normalizeEmail(email);
    this.passwordPolicy.assertValid(password);

    return this.dataSource.transaction(async (manager) => {
      const existingIdentifier =
        await this.identifiers.findEmailInTransaction(
          manager,
          normalizedEmail,
        );

      if (existingIdentifier) {
        throw new ApiException({
          statusCode: HttpStatus.CONFLICT,
          code: ApiCodeResponse.AuthEmailAlreadyUsed,
          logMessage: 'Email address is already used',
        });
      }

      const accountRepository = manager.getRepository(AccountEntity);
      const account = await accountRepository.save(
        accountRepository.create(),
      );

      await this.identifiers.create(manager, account.id, normalizedEmail);
      await this.passwordCredentials.create(manager, account.id, password);

      const created = await this.sessions.createSession(manager, account.id);

      return {
        accountId: account.id,
        sessionId: created.session.id,
        accessToken: this.tokenCrypto.signAccessToken(
          account.id,
          created.session.id,
          created.session.accessVersion,
        ),
        refreshToken: created.refreshToken,
        csrfToken: created.csrfToken,
        refreshExpiresAt: created.refreshExpiresAt,
      };
    });
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthenticatedSession> {
    const normalizedEmail = normalizeEmail(email);
    const identifier = await this.identifiers.findEmail(normalizedEmail);

    if (!identifier) {
      await this.passwordHasher.verifyAgainstDummy(password);
      throw new AuthSecurityException();
    }

    const credential = await this.passwordCredentials.findByAccountId(
      identifier.accountId,
    );

    if (
      !credential ||
      credential.disabledAt !== null ||
      (credential.lockedUntil !== null &&
        credential.lockedUntil > new Date())
    ) {
      await this.passwordHasher.verifyAgainstDummy(password);
      throw new AuthSecurityException();
    }

    let passwordIsValid = false;

    try {
      passwordIsValid = await this.passwordHasher.verify(
        credential.passwordHash,
        password,
      );
    } catch {
      passwordIsValid = false;
    }

    if (!passwordIsValid) {
      await this.dataSource.transaction((manager) =>
        this.passwordCredentials.recordFailedAttempt(manager, credential.id),
      );

      throw new AuthSecurityException();
    }

    const account = await this.accountService.findById(identifier.accountId);

    if (!account || !this.accountService.canAuthenticate(account)) {
      throw new AuthSecurityException();
    }

    return this.dataSource.transaction(async (manager) => {
      await this.passwordCredentials.recordSuccessfulUse(
        manager,
        credential.id,
      );

      const created = await this.sessions.createSession(
        manager,
        account.id,
      );

      return {
        accountId: account.id,
        sessionId: created.session.id,
        accessToken: this.tokenCrypto.signAccessToken(
          account.id,
          created.session.id,
          created.session.accessVersion,
        ),
        refreshToken: created.refreshToken,
        csrfToken: created.csrfToken,
        refreshExpiresAt: created.refreshExpiresAt,
      };
    });
  }

  async logout(auth: AuthContext, request: Request): Promise<void> {
    const session = await this.sessions.verifyContext(auth);
    this.csrfService.assertValid(request, session);

    await this.dataSource.transaction((manager) =>
      this.sessions.revoke(manager, session.id, 'logout'),
    );
  }

  async logoutAll(auth: AuthContext, request: Request): Promise<void> {
    const session = await this.sessions.verifyContext(auth);
    this.csrfService.assertValid(request, session);

    await this.dataSource.transaction(async (manager) => {
      const sessions = await manager
        .getRepository(AuthSessionEntity)
        .findBy({
          accountId: auth.accountId,
          revokedAt: IsNull(),
        });

      for (const accountSession of sessions) {
        await this.sessions.revoke(
          manager,
          accountSession.id,
          'logout-all',
        );
      }
    });
  }
}