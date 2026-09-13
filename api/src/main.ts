import { NestFactory } from '@nestjs/core';
import { AppModule } from './root/app.module.js';

export const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
};

void bootstrap();