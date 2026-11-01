import { Column, Entity, ForeignKey, Index } from 'typeorm';

import { BasePersistenceEntity } from '../../../../common/database/base/base-persistence.entity';
import { ULID_LENGTH } from '../../../../common/utils/ulid.util';
import { AccountEntity } from '../../../account/data/entity/account.entity';
import { AuthIdentifierType } from '../enum/auth-identifier-type.enum';

@Entity({ name: 'auth_identifier' })
@Index('uq_auth_identifier_type_value', ['type', 'value'], { unique: true })
@Index('idx_auth_identifier_account_id', ['accountId'])
@ForeignKey(() => AccountEntity, ['accountId'], ['id'], {
  name: 'FK_auth_identifier_account',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
})
export class AuthIdentifierEntity extends BasePersistenceEntity {
  @Column({
    name: 'account_id',
    type: 'varchar',
    length: ULID_LENGTH,
  })
  accountId!: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: AuthIdentifierType,
  })
  type!: AuthIdentifierType;

  @Column({
    name: 'value',
    type: 'varchar',
    length: 320,
  })
  value!: string;

  @Column({
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  verifiedAt!: Date | null;

  @Column({
    name: 'is_primary',
    type: 'boolean',
    default: false,
  })
  isPrimary!: boolean;
}