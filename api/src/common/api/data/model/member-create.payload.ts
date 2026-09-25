import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class MemberCreatePayload {
  @IsNotEmpty({ message: 'api.member.error.is-empty' })
  @MaxLength(15)
  firstname: string = '';

  @IsNotEmpty()
  lastname: string = '';

  @IsOptional()
  birthdate?: Date;
}