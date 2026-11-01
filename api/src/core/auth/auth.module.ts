import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthIdentifierEntity } from './data/entity/auth-identifier.entity';
import { AuthRefreshTokenEntity } from './data/entity/auth-refresh-token.entity';
import { AuthSessionEntity } from './data/entity/auth-session.entity';
import { PasswordCredentialEntity } from './data/entity/password-credential.entity';
import { AuthCookieService } from './service/auth-cookie.service';
import { CsrfService } from './service/csrf.service';
import { PasswordHasherService } from './service/password-hasher.service';
import { PasswordPolicyService } from './service/password-policy.service';
import { TokenCryptoService } from './service/token-crypto.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthIdentifierEntity,
      PasswordCredentialEntity,
      AuthSessionEntity,
      AuthRefreshTokenEntity,
    ]),
  ],
  providers: [
    AuthCookieService,
    CsrfService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
  ],
  exports: [
    AuthCookieService,
    CsrfService,
    PasswordHasherService,
    PasswordPolicyService,
    TokenCryptoService,
  ],
})
export class AuthModule {}