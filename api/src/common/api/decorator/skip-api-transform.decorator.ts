import { SetMetadata } from '@nestjs/common';

export const SKIP_API_TRANSFORM_METADATA_KEY = 'api:skip-transform';

export function SkipApiTransform(): MethodDecorator & ClassDecorator {
  return SetMetadata(SKIP_API_TRANSFORM_METADATA_KEY, true);
}