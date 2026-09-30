import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ValidatedEnvironment } from '../../config/environment/environment.validation';
import { AppMode } from '../../config/data/enum';
import { AccountEntity } from '../../../core/account/data/entity/account.entity';

export function createTypeOrmOptions(
  environment: ValidatedEnvironment,
): TypeOrmModuleOptions {
  let synchronize = environment.DB_SYNC;

  if (environment.NODE_ENV === AppMode.Prod) {
    synchronize = false;
  }

  return {
    type: environment.DB_TYPE,
    host: environment.DB_HOST,
    port: environment.DB_PORT,
    username: environment.DB_USER,
    password: environment.DB_PASSWORD,
    database: environment.DB_DATABASE,
    schema: environment.DB_SCHEMA,
    synchronize: synchronize,
    logging: environment.DB_LOG,
    entities: [AccountEntity],
    autoLoadEntities: true,
  };
}