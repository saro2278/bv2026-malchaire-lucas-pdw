import {
  ArgumentMetadata,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { ApiException } from '../api/data/exception/api-exception';
import { ApiCodeResponse } from '../api/data/enum/api-code-response.enum';
import { ULID_REGEX } from '../utils/ulid.util';

@Injectable()
export class ParseUlidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string' || !ULID_REGEX.test(value)) {
      let parameterName = metadata.data;

      if (parameterName === undefined) {
        parameterName = 'unknown';
      }

      throw new ApiException({
        statusCode: HttpStatus.BAD_REQUEST,
        code: ApiCodeResponse.CommonInvalidIdentifier,
        logMessage: 'Invalid ULID for parameter ' + parameterName,
      });
    }

    return value;
  }
}