import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSharkDto {
  @ApiPropertyOptional({ example: 'Apex Ventures' })
  @IsOptional()
  @IsString()
  fundName?: string;

  @ApiPropertyOptional({ example: '$100K' })
  @IsOptional()
  @IsString()
  minTicket?: string;

  @ApiPropertyOptional({ example: '$5M' })
  @IsOptional()
  @IsString()
  maxTicket?: string;
}
