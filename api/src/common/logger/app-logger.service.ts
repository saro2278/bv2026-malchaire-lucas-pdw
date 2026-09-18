import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

type LogFields = {
  event: string;
  data?: Record<string, unknown>;
};

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  constructor(private readonly logger: PinoLogger) {}

  setContext(context: string): void {
    this.logger.setContext(context);
  }

  application(fields: LogFields): void {
    this.logger.info({ ...fields, category: 'application' });
  }

  security(fields: LogFields): void {
    this.logger.warn({ ...fields, category: 'security' });
  }

  audit(fields: LogFields): void {
    this.logger.info({ ...fields, category: 'audit' });
  }
}