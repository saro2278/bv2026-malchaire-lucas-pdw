import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    example: 'lucas@example.com',
  })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({
    example: 'MonMotDePasse123!',
  })
  @IsString()
  @MaxLength(128)
  password!: string;
}