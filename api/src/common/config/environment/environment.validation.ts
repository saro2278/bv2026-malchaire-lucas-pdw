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
    APP_BASE_URL: z.string().min(1).default('api'),
    APP_HTTP_PAYLOAD_ERROR_CODE: z.coerce
      .number()
      .int()
      .min(400)
      .max(499)
      .default(422),

    NODE_ENV: appModeSchema,
    LOG_LEVEL: z.enum(LogLevel).default(LogLevel.Info),

    DB_TYPE: z.literal('postgres').default('postgres'),
    DB_HOST: z.string().min(1).default('localhost'),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_DATABASE: z.string().min(1),
    DB_SCHEMA: z.string().min(1).default('public'),

    DB_MIGRATION: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),

    DB_LOG: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),

    DB_SYNC: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),

    AUTH_PASSWORD_MIN_LENGTH: z.coerce.number().int().min(1).default(15),
    AUTH_PASSWORD_MAX_LENGTH: z.coerce.number().int().min(1).default(128),

    AUTH_ARGON2_MEMORY_COST: z.coerce
      .number()
      .int()
      .min(19456)
      .default(19456),
    AUTH_ARGON2_TIME_COST: z.coerce.number().int().min(1).default(2),
    AUTH_ARGON2_PARALLELISM: z.coerce.number().int().min(1).default(1),

    AUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .max(600)
      .default(600),

    AUTH_JWT_ISSUER: z.string().min(1).default('hoos-api'),
    AUTH_JWT_AUDIENCE: z.string().min(1).default('hoos-client'),
    AUTH_JWT_KEY_ID: z
      .string()
      .regex(/^[A-Za-z0-9._-]{1,100}$/)
      .default('dev-1'),

    AUTH_JWT_PRIVATE_KEY_PEM: z
      .string()
      .min(1)
      .transform((value) => value.replace(/\\n/g, '\n')),

    AUTH_JWT_PUBLIC_KEY_PEM: z
      .string()
      .min(1)
      .transform((value) => value.replace(/\\n/g, '\n')),

    AUTH_REFRESH_TOKEN_PEPPER: z.string().min(32),
  })
  .superRefine((environment, context) => {
    if (environment.NODE_ENV === AppMode.Prod && environment.DB_SYNC) {
      context.addIssue({
        code: 'custom',
        path: ['DB_SYNC'],
        message: 'DB_SYNC doit être false en production.',
      });
    }

    if (
      environment.AUTH_PASSWORD_MIN_LENGTH >
      environment.AUTH_PASSWORD_MAX_LENGTH
    ) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_PASSWORD_MAX_LENGTH'],
        message:
          'La longueur maximale doit être supérieure ou égale à la longueur minimale.',
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