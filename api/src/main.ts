import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { EnvService } from '@common/config/env.service';
import { AppModule } from '@root/app.module';
import { AppLogger } from './common/logger/app-logger.service';
import { ApiInterceptor } from './common/api/interceptor/api.interceptor';
import { HttpExceptionFilter } from './common/api/filter/http-exception.filter';
import { ValidationException } from './common/api/data/exception/validation-exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule.register(), {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  const envService = app.get(EnvService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      exceptionFactory: (errors) => {
        return ValidationException.fromClassValidatorErrors(
          errors,
          envService.httpPayloadErrorStatusCode,
        );
      },
    }),
  );

  app.useGlobalInterceptors(app.get(ApiInterceptor));
  app.useGlobalFilters(app.get(HttpExceptionFilter));

  const swaggerConfig = new DocumentBuilder()
  .setTitle('API du cours')
  .setDescription('Documentation et tests des routes')
  .setVersion('1.0')
  .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

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