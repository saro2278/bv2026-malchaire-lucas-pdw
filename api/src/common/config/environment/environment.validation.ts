import { z } from 'zod';
import { AppMode, LogLevel } from '../data/enum';
const appModeSchema = z
  .enum(['DEV', 'TEST', 'PROD', 'development', 'test', 'production'])
  .transform((value) => {
    if (value === 'development') {
      return AppMode.Dev;
    }

    if (value === 'test') {
      return AppMode.Test;
    }

    if (value === 'production') {
      return AppMode.Prod;
    }

    return value as AppMode;
  });

const environmentSchema = z
  .object({
    APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    APP_HTTP_PAYLOAD_ERROR_CODE: z.coerce
    .number()
    .int()
    .min(400)
    .max(499)
    .default(422),
    NODE_ENV: appModeSchema,
    LOG_LEVEL: z.enum(LogLevel).default(LogLevel.Info),
    DB_SYNC: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === AppMode.Prod && env.DB_SYNC) {
      ctx.addIssue({
        code: 'custom',
        path: ['DB_SYNC'],
        message: 'DB_SYNC doit être false en production.',
      });
    }
  });

export type ValidatedEnvironment = z.infer<typeof environmentSchema>;

export const validateEnvironment = (
  config: Record<string, unknown>,
): ValidatedEnvironment => {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return result.data;
};
