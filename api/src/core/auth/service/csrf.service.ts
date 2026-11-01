import { HttpStatus, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

import { ApiCodeResponse } from '../../../common/api/data/enum/api-code-response.enum';
import { AuthSessionEntity } from '../data/entity/auth-session.entity';
import { AuthSecurityException } from '../data/exception/auth-security.exception';
import { TokenCryptoService } from './token-crypto.service';

@Injectable()
export class CsrfService {
  constructor(private readonly tokenCrypto: TokenCryptoService) {}

  assertValid(request: Request, session: AuthSessionEntity): void {
    const token = request.header('X-CSRF-Token');

    if (!token || token.length > 512) {
      throw new AuthSecurityException(
        ApiCodeResponse.AuthCsrfInvalid,
        HttpStatus.FORBIDDEN,
      );
    }

    const actual = Buffer.from(this.tokenCrypto.fingerprint(token), 'hex');
    const expected = Buffer.from(session.csrfTokenHash, 'hex');

    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      throw new AuthSecurityException(
        ApiCodeResponse.AuthCsrfInvalid,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}