import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiSuccessCode, SkipApiTransform } from '../common/api';
import { ApiCodeResponse } from '../common/api/data/enum/api-code-response.enum';
import { ApiException } from '../common/api/data/exception/api-exception';
import { ValidationException } from '../common/api/data/exception/validation-exception';
import { ParseUlidPipe } from '../common/validation/parse-ulid.pipe';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiSuccessCode(ApiCodeResponse.CommonSuccess)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('raw')
  @SkipApiTransform()
  getRawHello(): string {
    return this.appService.getHello();
  }

  @Get('hello-v3')
getHelloV3(): never {
  throw new ApiException({
    statusCode: HttpStatus.BAD_GATEWAY,
  });
}

@Get('hello-v4')
getHelloV4(): never {
  throw new ValidationException([]);
}

@Get('test-id/:id')
testId(@Param('id', ParseUlidPipe) id: string): string {
  return id;
}
}