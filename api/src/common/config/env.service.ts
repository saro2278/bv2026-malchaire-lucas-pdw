import { Injectable } from '@nestjs/common';
import { ValidatedEnvironment } from './environment/environment.validation';
import { ConfigService } from '@nestjs/config';
import { AppMode, ConfigKey, LogLevel } from './data/enum';
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

  get logLevel(): LogLevel {
  return this.get(ConfigKey.LogLevel);
}

  get<T extends keyof ValidatedEnvironment>(key: T): ValidatedEnvironment[T] {
    return this.configService.getOrThrow(key, { infer: true });
  }
}
