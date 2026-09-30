import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@common/config/app-config.module';
import { AppLoggerModule } from '../common/logger/app-logger.module';
import { ApiInterceptor } from '../common/api/interceptor/api.interceptor';
import { HttpExceptionFilter } from '../common/api/filter/http-exception.filter';
import { DatabaseModule } from '../common/database/database.module';
import { AccountModule } from '../core/account/account.module';

@Module({})
export class AppModule {
  static register(): DynamicModule {
    return {
      module: AppModule,
      imports: [AppConfigModule.register(), AppLoggerModule, DatabaseModule, AccountModule],
      controllers: [AppController],
      providers: [AppService, ApiInterceptor, HttpExceptionFilter],
    };
  }
}
