import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../model/api-response';
import { ApiValidationError } from '../model/api-validation-error';

export type ApiExceptionOptions<T = unknown> = {
  statusCode?: HttpStatus;
  code?: string;
  data?: T | null;
  validationErrors?: ApiValidationError[];
  logMessage?: string;
};

export class ApiException<T = unknown> extends HttpException {
  readonly apiCode: string;
  readonly apiData: T | null;
  readonly apiValidationErrors: ApiValidationError[];
  readonly logMessage: string | undefined;

  constructor(options: ApiExceptionOptions<T> = {}) {
    let statusCode = options.statusCode;

    if (statusCode === undefined) {
      statusCode = HttpStatus.BAD_REQUEST;
    }

    const response = ApiResponse.error<T>(options);

    super(response, statusCode);

    this.apiCode = response.code;
    this.apiData = response.data;
    this.apiValidationErrors = response.validationErrors;
    this.logMessage = options.logMessage;
  }
}