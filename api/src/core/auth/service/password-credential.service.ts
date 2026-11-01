import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { PasswordCredentialEntity } from '../data/entity/password-credential.entity';
import { PasswordHasherService } from './password-hasher.service';

@Injectable()
export class PasswordCredentialService {
  private readonly maxFailedAttempts = 5;
  private readonly lockoutSeconds = 900;

  constructor(
    @InjectRepository(PasswordCredentialEntity)
    private readonly credentialRepository: Repository<PasswordCredentialEntity>,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async findByAccountId(
    accountId: string,
  ): Promise<PasswordCredentialEntity | null> {
    return this.credentialRepository.findOneBy({ accountId });
  }

  async create(
    manager: EntityManager,
    accountId: string,
    password: string,
  ): Promise<PasswordCredentialEntity> {
    const repository = manager.getRepository(PasswordCredentialEntity);

    const credential = repository.create({
      accountId,
      passwordHash: await this.passwordHasher.hash(password),
      hashVersion: 'argon2id-v1',
      failedAttempts: 0,
      lockedUntil: null,
      lastFailedAt: null,
      lastUsedAt: null,
      changedAt: new Date(),
      disabledAt: null,
    });

    return repository.save(credential);
  }

  async recordFailedAttempt(
    manager: EntityManager,
    credentialId: string,
  ): Promise<void> {
    const repository = manager.getRepository(PasswordCredentialEntity);

    await repository
      .createQueryBuilder()
      .update(PasswordCredentialEntity)
      .set({
        failedAttempts: () => 'failed_attempts + 1',
        lastFailedAt: () => 'CURRENT_TIMESTAMP',
        lockedUntil: () =>
          `CASE
            WHEN failed_attempts + 1 >= ${this.maxFailedAttempts}
            THEN CURRENT_TIMESTAMP + (${this.lockoutSeconds} * INTERVAL '1 second')
            ELSE locked_until
          END`,
      })
      .where('id = :credentialId', { credentialId })
      .andWhere('(locked_until IS NULL OR locked_until <= CURRENT_TIMESTAMP)')
      .execute();
  }

  async recordSuccessfulUse(
    manager: EntityManager,
    credentialId: string,
  ): Promise<void> {
    await manager.getRepository(PasswordCredentialEntity).update(credentialId, {
      failedAttempts: 0,
      lockedUntil: null,
      lastUsedAt: new Date(),
    });
  }
}