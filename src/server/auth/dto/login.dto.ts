import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'founder@ventureflow.io', description: 'Email or user ID' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'Str0ngPassw0rd!' })
  @IsString()
  @MinLength(1)
  password: string;
}
