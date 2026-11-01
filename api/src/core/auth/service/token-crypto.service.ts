import { Injectable } from '@nestjs/common';
import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  KeyObject,
  randomBytes,
} from 'crypto';
import * as jwt from 'jsonwebtoken';

import { EnvService } from '../../../common/config/env.service';
import { ULID_REGEX, createUlid } from '../../../common/utils/ulid.util';
import { AuthSecurityException } from '../data/exception/auth-security.exception';

export type AccessTokenClaims = jwt.JwtPayload & {
  sub: string;
  sid: string;
  ver: number;
  jti: string;
  iat: number;
  exp: number;
};

@Injectable()
export class TokenCryptoService {
  private readonly privateKey: KeyObject;
  private readonly publicKeys = new Map<string, KeyObject>();
  private readonly keyId: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly refreshPepper: string;

  constructor(private readonly envService: EnvService) {
    this.privateKey = createPrivateKey(this.envService.jwtPrivateKeyPem);
    this.keyId = this.envService.jwtKeyId;
    this.issuer = this.envService.jwtIssuer;
    this.audience = this.envService.jwtAudience;
    this.refreshPepper = this.envService.refreshTokenPepper;

    this.publicKeys.set(
      this.keyId,
      createPublicKey(this.envService.jwtPublicKeyPem),
    );
  }

  signAccessToken(
    accountId: string,
    sessionId: string,
    accessVersion: number,
  ): string {
    return jwt.sign(
      {
        sub: accountId,
        sid: sessionId,
        ver: accessVersion,
      },
      this.privateKey,
      {
        algorithm: 'ES256',
        issuer: this.issuer,
        audience: this.audience,
        expiresIn: this.envService.accessTokenTtlSeconds,
        jwtid: createUlid(),
        header: {
          alg: 'ES256',
          typ: 'at+jwt',
          kid: this.keyId,
        },
      },
    );
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    if (token.length > 4096 || token.split('.').length !== 3) {
      throw new AuthSecurityException();
    }

    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || typeof decoded === 'string') {
      throw new AuthSecurityException();
    }

    const header = decoded.header;

    if (
      header.alg !== 'ES256' ||
      header.typ !== 'at+jwt' ||
      typeof header.kid !== 'string' ||
      !/^[A-Za-z0-9._-]{1,100}$/.test(header.kid) ||
      'jku' in header ||
      'jwk' in header ||
      'x5u' in header ||
      'x5c' in header ||
      'crit' in header
    ) {
      throw new AuthSecurityException();
    }

    const key = this.publicKeys.get(header.kid);

    if (!key) {
      throw new AuthSecurityException();
    }

    let verified: string | jwt.JwtPayload;

    try {
      verified = jwt.verify(token, key, {
        algorithms: ['ES256'],
        issuer: this.issuer,
        audience: this.audience,
        maxAge: `${this.envService.accessTokenTtlSeconds}s`,
        clockTolerance: 5,
      });
    } catch {
      throw new AuthSecurityException();
    }

    if (typeof verified === 'string') {
      throw new AuthSecurityException();
    }

    if (
      typeof verified.sub !== 'string' ||
      !ULID_REGEX.test(verified.sub) ||
      typeof verified.sid !== 'string' ||
      !ULID_REGEX.test(verified.sid) ||
      typeof verified.jti !== 'string' ||
      !ULID_REGEX.test(verified.jti) ||
      typeof verified.ver !== 'number' ||
      !Number.isInteger(verified.ver) ||
      typeof verified.iat !== 'number' ||
      typeof verified.exp !== 'number' ||
      verified.exp <= verified.iat ||
      verified.exp - verified.iat > this.envService.accessTokenTtlSeconds
    ) {
      throw new AuthSecurityException();
    }

    return verified as AccessTokenClaims;
  }

  createOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  fingerprint(value: string): string {
    return createHmac('sha256', this.refreshPepper).update(value).digest('hex');
  }
}