import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'founder@ventureflow.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'VF-892104' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'N3wStr0ngPassword!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
