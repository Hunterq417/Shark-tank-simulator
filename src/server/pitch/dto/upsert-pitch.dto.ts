import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, IsUrl, Max, Min } from 'class-validator';

export class UpsertPitchDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiProperty()
  @IsUUID()
  startupId: string;

  @ApiPropertyOptional({ example: '$850K' })
  @IsOptional()
  @IsString()
  totalCommitted?: string;

  @ApiPropertyOptional({ example: 57.0, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentageCommitted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transcript?: string;
}
