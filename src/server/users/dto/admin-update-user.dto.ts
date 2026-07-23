import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'Jordan Blake' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Apex Ventures' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: '$15,000,000' })
  @IsOptional()
  @IsString()
  balance?: string;
}
