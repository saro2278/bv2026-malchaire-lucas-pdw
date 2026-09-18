import { EnvService } from '@common/config/env.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@root/app.module';
import { Logger } from 'nestjs-pino';
import { AppLogger } from './common/logger/app-logger.service';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule.register(), {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const envService = app.get(EnvService);
  await app.listen(envService.appPort);
  const appLogger = await app.resolve(AppLogger);
appLogger.setContext('Bootstrap');

appLogger.application({
  event: 'application.started',
  data: {
    port: envService.appPort,
  },
});
};

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});