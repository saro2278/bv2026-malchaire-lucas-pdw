import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

import { ApiException } from '../data/exception/api-exception';
import { ApiResponse } from '../data/model/api-response';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode = this.getStatusCode(exception);
    const body = this.toApiResponse(exception);

    this.logException(exception, request, statusCode, body.code);

    response.status(statusCode).json(body);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private toApiResponse(exception: unknown): ApiResponse<unknown> {
    if (exception instanceof ApiException) {
      return ApiResponse.error({
        code: exception.apiCode,
        data: exception.apiData,
        validationErrors: exception.apiValidationErrors,
      });
    }

    return ApiResponse.error();
  }

  private logException(
    exception: unknown,
    request: Request,
    statusCode: number,
    code: string,
  ): void {
    let message = 'HTTP request failed';

    if (exception instanceof ApiException) {
      if (exception.logMessage !== undefined) {
        message = exception.logMessage;
      }
    }

    const details = {
      event: 'http.request.failed',
      category: 'application',
      method: request.method,
      path: request.path,
      statusCode: statusCode,
      code: code,
    };

    if (statusCode >= 500) {
      this.logger.error(details, message);
    } else {
      this.logger.warn(details, message);
    }
  }
}