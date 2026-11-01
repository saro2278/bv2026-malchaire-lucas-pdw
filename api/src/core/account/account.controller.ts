import { Controller, Get } from '@nestjs/common';

import type { AuthContext } from '../auth/data/model/auth-context';
import { CurrentAuth } from '../auth/decorator/current-auth.decorator';
import { AccountService } from './account.service';
import { AccountResponseDto } from './data/dto/response/account-response.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  me(@CurrentAuth() auth: AuthContext): Promise<AccountResponseDto> {
    return this.accountService.me(auth.accountId);
  }
}