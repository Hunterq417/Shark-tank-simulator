import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RegisterRole {
  FOUNDER = 'FOUNDER',
  SHARK = 'SHARK',
}

export class RegisterDto {
  @ApiProperty({ example: 'founder@ventureflow.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ngPassw0rd!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jordan Blake' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ enum: RegisterRole, default: RegisterRole.SHARK })
  @IsOptional()
  @IsEnum(RegisterRole)
  role?: RegisterRole;

  @ApiPropertyOptional({ example: 'Apex Ventures' })
  @IsOptional()
  @IsString()
  company?: string;
}
