import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { EnvService } from '../config/env.service';
import { createUlid, ULID_REGEX } from '../utils/ulid.util';
import { AppLogger } from './app-logger.service';

const sensitiveFields = [
  'password',
  'pin',
  'otp',
  'accessToken',
  'refreshToken',
  'secret',
  'apiKey',
  'databasePassword',
];

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        pinoHttp: {
          level: env.logLevel,

          customLogLevel: (req, res, err) => {
            if (err || res.statusCode >= 500) {
              return 'error';
            }

            if (res.statusCode >= 400) {
              return 'warn';
            }

            const path = req.url?.split('?')[0];

            if (
              path === '/health/live' &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              return 'silent';
            }

            return 'info';
          },

          genReqId: (req, res) => {
            const incomingId = req.headers['x-request-id'];

            const requestId =
              typeof incomingId === 'string' &&
              ULID_REGEX.test(incomingId)
                ? incomingId
                : createUlid();

            res.setHeader('X-Request-Id', requestId);

            return requestId;
          },

          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers["set-cookie"]',
              ...sensitiveFields.flatMap((field) => [
                field,
                `*.${field}`,
                `req.body.${field}`,
                `req.query.${field}`,
                `req.body.*.${field}`,
                `req.query.*.${field}`,
              ]),
            ],
            censor: '[REDACTED]',
          },
        },
      }),
    }),
  ],
  providers: [AppLogger],
  exports: [LoggerModule, AppLogger],
})
export class AppLoggerModule {}