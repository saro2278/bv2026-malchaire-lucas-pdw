import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountEntity } from './data/entity/account.entity';
import { AccountResponseDto } from './data/dto/response/account-response.dto';
import { ApiException } from '../../common/api/data/exception/api-exception';
import { ApiCodeResponse } from '../../common/api/data/enum/api-code-response.enum';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  async findById(id: string): Promise<AccountEntity | null> {
    const account = await this.accountRepository.findOneBy({
      id: id,
    });

    return account;
  }

  async me(accountId: string): Promise<AccountResponseDto> {
    const account = await this.findById(accountId);

    if (account === null) {
      throw new ApiException({
        statusCode: HttpStatus.NOT_FOUND,
        code: ApiCodeResponse.AccountNotFound,
        logMessage: 'Current account was not found',
      });
    }

    return {
      id: account.id,
      status: account.status,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }

    async create(): Promise<AccountEntity> {
    const account = new AccountEntity();

    const savedAccount = await this.accountRepository.save(account);

    return savedAccount;
  }
}