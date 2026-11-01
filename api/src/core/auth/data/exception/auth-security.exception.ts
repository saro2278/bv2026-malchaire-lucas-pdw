import { HttpStatus } from '@nestjs/common';

import { ApiCodeResponse } from '../../../../common/api/data/enum/api-code-response.enum';
import { ApiException } from '../../../../common/api/data/exception/api-exception';

export class AuthSecurityException extends ApiException<null> {
  constructor(
    code: string = ApiCodeResponse.AuthUnauthorized,
    statusCode: HttpStatus = HttpStatus.UNAUTHORIZED,
  ) {
    super({
      statusCode,
      code,
      logMessage: 'Authentication security validation failed',
    });
  }
}