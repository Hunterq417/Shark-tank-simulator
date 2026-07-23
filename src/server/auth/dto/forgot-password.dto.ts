import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'founder@ventureflow.io' })
  @IsEmail()
  email: string;
}
