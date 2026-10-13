import { Repository } from 'typeorm';

import { ApiCodeResponse } from '../../common/api/data/enum/api-code-response.enum';
import { ApiException } from '../../common/api/data/exception/api-exception';
import { AccountService } from './account.service';
import { AccountEntity } from './data/entity/account.entity';
import { AccountStatus } from './data/enum/account-status.enum';

describe('AccountService', () => {
  const accountId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

  let repository: Pick<Repository<AccountEntity>, 'findOneBy'>;
  let service: AccountService;

  beforeEach(() => {
    repository = {
      findOneBy: jest.fn(),
    };

    service = new AccountService(repository as Repository<AccountEntity>);
  });

  it('returns the account as a response DTO', async () => {
    const createdAt = new Date('2026-09-30T12:00:00.000Z');
    const updatedAt = new Date('2026-09-30T13:00:00.000Z');

    const account = Object.assign(new AccountEntity(), {
      id: accountId,
      status: AccountStatus.Active,
      anonymizedAt: null,
      createdAt,
      updatedAt,
      version: 1,
    });

    jest.mocked(repository.findOneBy).mockResolvedValue(account);

    await expect(service.me(accountId)).resolves.toEqual({
      id: accountId,
      status: AccountStatus.Active,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it('throws an API error when the account does not exist', async () => {
    jest.mocked(repository.findOneBy).mockResolvedValue(null);

    await expect(service.me(accountId)).rejects.toMatchObject<ApiException>({
      apiCode: ApiCodeResponse.AccountNotFound,
    });
  });
});