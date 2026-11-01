import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppConfigModule } from '@common/config/app-config.module';
import { ApiInterceptor } from '../common/api/interceptor/api.interceptor';
import { HttpExceptionFilter } from '../common/api/filter/http-exception.filter';
import { AppLoggerModule } from '../common/logger/app-logger.module';
import { DatabaseModule } from '../common/database/database.module';
import { AccountModule } from '../core/account/account.module';
import { AuthModule } from '../core/auth/auth.module';
import { AccessAuthGuard } from '../core/auth/guard/access-auth.guard';
import { OriginGuard } from '../core/auth/guard/origin.guard';
import { HealthModule } from '@core/health';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({})
export class AppModule {
  static register(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        AppConfigModule.register(),
        AppLoggerModule,
        DatabaseModule,
        AccountModule,
        AuthModule,
        HealthModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        ApiInterceptor,
        HttpExceptionFilter,
        {
          provide: APP_GUARD,
          useClass: OriginGuard,
        },
        {
          provide: APP_GUARD,
          useClass: AccessAuthGuard,
        },
      ],
    };
  }
}