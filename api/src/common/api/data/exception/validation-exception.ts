import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api-exception';
import { ApiCodeResponse } from '../enum/api-code-response.enum';
import { ApiValidationError } from '../model/api-validation-error';
import { ValidationError } from 'class-validator';

export class ValidationException extends ApiException<null> {
  constructor(
    validationErrors: ApiValidationError[],
    statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({
      statusCode: statusCode,
      code: ApiCodeResponse.CommonValidationError,
      data: null,
      validationErrors: validationErrors,
      logMessage: 'Request validation failed',
    });
  }

  static fromClassValidatorErrors(
  errors: ValidationError[],
  statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
): ValidationException {
  const validationErrors: ApiValidationError[] = [];

  for (const error of errors) {
    const convertedError = ValidationException.mapValidationError(error);
    validationErrors.push(convertedError);
  }

  return new ValidationException(validationErrors, statusCode);
}

private static mapValidationError(
  error: ValidationError,
): ApiValidationError {
  const convertedError = new ApiValidationError();

  convertedError.property = error.property;

  if (error.constraints !== undefined) {
  for (const [constraint, message] of Object.entries(error.constraints)) {
    const convertedMessage =
      ValidationException.toMachineReadableMessage(constraint, message);

    convertedError.messages.push(convertedMessage);
  }
}

  if (error.children !== undefined && error.children.length > 0) {
    convertedError.children = [];

    for (const child of error.children) {
      const convertedChild = ValidationException.mapValidationError(child);
      convertedError.children.push(convertedChild);
    }
  }

  return convertedError;
  
}
private static toMachineReadableMessage(
  constraint: string,
  message: string,
): string {
  if (message.startsWith('api.')) {
    return message;
  }

  let name = constraint.replace(/([a-z])([A-Z])/g, '$1-$2');
  name = name.replace(/_/g, '-');
  name = name.toLowerCase();

  return 'api.validation.' + name;
}
}