import { SetMetadata } from '@nestjs/common';

export const API_SUCCESS_CODE_METADATA_KEY = 'api:success-code';

export function ApiSuccessCode(code: string): MethodDecorator {
  return SetMetadata(API_SUCCESS_CODE_METADATA_KEY, code);
}