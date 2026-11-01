import { Controller, Get } from '@nestjs/common';

import { SkipApiTransform } from '@common/api';
import { Public } from '../auth/decorator/public.decorator';

@SkipApiTransform()
@Controller('health')
export class HealthController {
  @Public()
  @Get('live')
  live(): { status: string } {
    return { status: 'ok' };
  }
}