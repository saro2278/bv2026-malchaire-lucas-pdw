import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountModule } from '../account/account.module';
import { AuthController } from './auth.controller';
import { AuthIdentifierEntity } from './data/entity/auth-identifier.entity';
import { AuthRefreshTokenEntity } from './data/entity/auth-refresh-token.entity';
import { AuthSessionEntity } from './data/entity/auth-session.entity';
import { PasswordCredentialEntity } from './data/entity/password-credential.entity';
import { AccessAuthGuard } from './guard/access-auth.guard';
import { OriginGuard } from './guard/origin.guard';
import { AuthService } from './service/auth.service';
import { AuthCookieService } from './service/auth-cookie.service';
import { AuthIdentifierService } from './service/auth-identifier.service';
import { AuthSessionService } from './service/auth-session.service';
import { CsrfService } from './service/csrf.service';
import { PasswordCredentialService } from './service/password-credential.service';
import { PasswordHasherService } from './service/password-hasher.service';
import { PasswordPolicyService } from './service/password-policy.service';
import { RefreshTokenService } from './service/refresh-token.service';
import { TokenCryptoService } from './service/token-crypto.service';

@Module({
  imports: [
    AccountModule,
    TypeOrmModule.forFeature([
      AuthIdentifierEntity,
      PasswordCredentialEntity,
      AuthSessionEntity,
      AuthRefreshTokenEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthIdentifierService,
    PasswordCredentialService,
    AuthSessionService,
    RefreshTokenService,
    AuthCookieService,
    CsrfService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
    OriginGuard,
    AccessAuthGuard,
  ],
  exports: [
    AuthIdentifierService,
    PasswordCredentialService,
    AuthSessionService,
    RefreshTokenService,
    AuthCookieService,
    CsrfService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
    OriginGuard,
    AccessAuthGuard,
  ],
})
export class AuthModule {}