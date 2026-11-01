import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { ApiCodeResponse } from '../../../common/api/data/enum/api-code-response.enum';
import { EnvService } from '../../../common/config/env.service';
import { AuthSecurityException } from '../data/exception/auth-security.exception';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly envService: EnvService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.header('Origin');

    if (!origin || !this.envService.corsOrigins.includes(origin)) {
      throw new AuthSecurityException(
        ApiCodeResponse.AuthOriginInvalid,
        403,
      );
    }

    return true;
  }
}