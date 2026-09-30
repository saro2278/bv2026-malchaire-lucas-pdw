import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../../enum/account-status.enum';

export class AccountResponseDto {
  @ApiProperty({
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  id!: string;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.Active,
  })
  status!: AccountStatus;

  @ApiProperty({
    example: '2026-09-30T12:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2026-09-30T12:00:00.000Z',
  })
  updatedAt!: string;
}