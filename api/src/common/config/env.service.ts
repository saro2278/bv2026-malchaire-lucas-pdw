import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppMode, ConfigKey, LogLevel } from './data/enum';
import { ValidatedEnvironment } from './environment/environment.validation';

@Injectable()
export class EnvService {
  constructor(
    private readonly configService: ConfigService<ValidatedEnvironment, true>,
  ) {}

  get appMode(): AppMode {
    return this.get(ConfigKey.NodeEnv);
  }

  get appPort(): number {
    return this.get(ConfigKey.Port);
  }

  get appBaseUrl(): string {
    return this.get(ConfigKey.AppBaseUrl);
  }

  get corsOrigins(): string[] {
    return this.get(ConfigKey.AppCorsOrigin);
  }

  get httpPayloadErrorStatusCode(): number {
    return this.get(ConfigKey.AppHttpPayloadErrorCode);
  }

  get logLevel(): LogLevel {
    return this.get(ConfigKey.LogLevel);
  }

  get isProduction(): boolean {
    return this.appMode === AppMode.Prod;
  }

  get passwordMinLength(): number {
    return this.get(ConfigKey.AuthPasswordMinLength);
  }

  get passwordMaxLength(): number {
    return this.get(ConfigKey.AuthPasswordMaxLength);
  }

  get passwordArgon2MemoryCost(): number {
    return this.get(ConfigKey.AuthArgon2MemoryCost);
  }

  get passwordArgon2TimeCost(): number {
    return this.get(ConfigKey.AuthArgon2TimeCost);
  }

  get passwordArgon2Parallelism(): number {
    return this.get(ConfigKey.AuthArgon2Parallelism);
  }

  get accessTokenTtlSeconds(): number {
    return this.get(ConfigKey.AuthAccessTokenTtlSeconds);
  }

  get refreshTokenTtlSeconds(): number {
    return this.get(ConfigKey.AuthRefreshTokenTtlSeconds);
  }

  get sessionAbsoluteTtlSeconds(): number {
    return this.get(ConfigKey.AuthSessionAbsoluteTtlSeconds);
  }

  get jwtIssuer(): string {
    return this.get(ConfigKey.AuthJwtIssuer);
  }

  get jwtAudience(): string {
    return this.get(ConfigKey.AuthJwtAudience);
  }

  get jwtKeyId(): string {
    return this.get(ConfigKey.AuthJwtKeyId);
  }

  get jwtPrivateKeyPem(): string {
    return this.get(ConfigKey.AuthJwtPrivateKeyPem);
  }

  get jwtPublicKeyPem(): string {
    return this.get(ConfigKey.AuthJwtPublicKeyPem);
  }

  get refreshTokenPepper(): string {
    return this.get(ConfigKey.AuthRefreshTokenPepper);
  }

  get<T extends keyof ValidatedEnvironment>(
    key: T,
  ): ValidatedEnvironment[T] {
    return this.configService.getOrThrow(key, { infer: true });
  }
}