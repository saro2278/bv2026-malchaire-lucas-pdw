import { Injectable } from '@nestjs/common';
import { AppLogger } from '../common/logger/app-logger.service';

@Injectable()
export class AppService {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(AppService.name);
  }

  getHello(): string {
    this.logger.application({
      event: 'hello.requested',
    });

    return 'Hello World!';
  }
}