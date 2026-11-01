import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  })
  accountId!: string;

  @ApiProperty({
    example: 'jeton-csrf',
  })
  csrfToken!: string;
}