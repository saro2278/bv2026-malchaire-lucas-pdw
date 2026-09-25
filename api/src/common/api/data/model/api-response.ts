import { ApiProperty } from '@nestjs/swagger';
import { ApiCodeResponse } from '../enum/api-code-response.enum';
import { ApiValidationError } from './api-validation-error';

export class ApiResponse<T> {
  @ApiProperty({ example: ApiCodeResponse.CommonSuccess })
  code: string = ApiCodeResponse.CommonSuccess;

  @ApiProperty({ example: true })
  result: boolean = true;

  @ApiProperty({ nullable: true })
  data: T | null = null;

  @ApiProperty({ type: () => [ApiValidationError] })
  validationErrors: ApiValidationError[] = [];

  static success<T>(
    data: T,
    code: string = ApiCodeResponse.CommonSuccess,
  ): ApiResponse<T> {
    const response = new ApiResponse<T>();

    response.code = code;
    response.result = true;
    response.data = data;
    response.validationErrors = [];

    return response;
  }

  static error<T = null>(
  options: {
    code?: string;
    data?: T | null;
    validationErrors?: ApiValidationError[];
  } = {},
): ApiResponse<T> {
  const response = new ApiResponse<T>();

  response.result = false;
  response.code = ApiCodeResponse.CommonError;

  if (options.code !== undefined) {
    response.code = options.code;
  }

  if (options.data !== undefined) {
    response.data = options.data;
  }

  if (options.validationErrors !== undefined) {
    response.validationErrors = options.validationErrors;
  }

  return response;
}
}