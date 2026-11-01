import { ApiValidationError } from '../../../../common/api/data/model/api-validation-error';
import { ValidationException } from '../../../../common/api/data/exception/validation-exception';

export class PasswordPolicyException extends ValidationException {
  constructor(validationErrors: ApiValidationError[]) {
    super(validationErrors);
  }
}