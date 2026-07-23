import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AnalyzeDealDto {
  @ApiPropertyOptional({ example: 15000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  askingValuation?: number;

  @ApiPropertyOptional({ example: 25000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offeredValuation?: number;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fundingAmount?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  equityRequested?: number;

  @ApiPropertyOptional({ example: 2200000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  arr?: number;

  @ApiPropertyOptional({ example: 'AI & Data' })
  @IsOptional()
  @IsString()
  sector?: string;
}
