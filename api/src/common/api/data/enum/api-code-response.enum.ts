export enum ApiCodeResponse {
  CommonSuccess = 'api.common.success',
  CommonError = 'api.common.error',
  CommonValidationError = 'api.common.validation.error',
  CommonInvalidIdentifier = 'api.common.invalid-identifier',

  AccountNotFound = 'api.account.not-found',

  AuthUnauthorized = 'api.auth.unauthorized',
  AuthEmailAlreadyUsed = 'api.auth.email-already-used',
  AuthRefreshInvalid = 'api.auth.refresh-invalid',
  AuthCsrfInvalid = 'api.security.csrf-invalid',
  AuthOriginInvalid = 'api.security.origin-invalid',
}