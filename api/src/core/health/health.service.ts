import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHello(): { status: string } {
    return { status: 'ok' };
  }
}