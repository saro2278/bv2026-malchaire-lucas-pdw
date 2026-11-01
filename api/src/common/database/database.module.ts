import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvService } from '../config/env.service';
import { createTypeOrmOptions } from './typeorm/typeorm-options.factory';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) =>
        createTypeOrmOptions({
          NODE_ENV: env.get('NODE_ENV'),
          DB_TYPE: env.get('DB_TYPE'),
          DB_HOST: env.get('DB_HOST'),
          DB_PORT: env.get('DB_PORT'),
          DB_USER: env.get('DB_USER'),
          DB_PASSWORD: env.get('DB_PASSWORD'),
          DB_DATABASE: env.get('DB_DATABASE'),
          DB_SCHEMA: env.get('DB_SCHEMA'),
          DB_SYNC: env.get('DB_SYNC'),
          DB_LOG: env.get('DB_LOG'),
        }),
    }),
  ],
})
export class DatabaseModule {}