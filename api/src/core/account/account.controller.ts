import { Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountEntity } from './data/entity/account.entity';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  create(): Promise<AccountEntity> {
    return this.accountService.create();
  }
}