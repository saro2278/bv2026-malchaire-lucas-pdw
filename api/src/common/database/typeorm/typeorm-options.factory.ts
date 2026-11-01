import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppMode } from '../../config/data/enum';
import { ValidatedEnvironment } from '../../config/environment/environment.validation';
import { AccountEntity } from '../../../core/account/data/entity/account.entity';

type DatabaseEnvironment = Pick<
  ValidatedEnvironment,
  | 'NODE_ENV'
  | 'DB_TYPE'
  | 'DB_HOST'
  | 'DB_PORT'
  | 'DB_USER'
  | 'DB_PASSWORD'
  | 'DB_DATABASE'
  | 'DB_SCHEMA'
  | 'DB_SYNC'
  | 'DB_LOG'
>;

export function createTypeOrmOptions(
  environment: DatabaseEnvironment,
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
    synchronize,
    logging: environment.DB_LOG,
    entities: [AccountEntity],
    autoLoadEntities: true,
  };
}