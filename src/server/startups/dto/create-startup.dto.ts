import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateStartupDto {
  @ApiProperty({ example: 'Nexus AI' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'AI & Data' })
  @IsString()
  sector: string;

  @ApiProperty({ example: 'Seed' })
  @IsString()
  stage: string;

  @ApiPropertyOptional({ example: 'Autonomous systems for enterprise machine learning.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '$1.5M' })
  @IsString()
  fundingAsk: string;

  @ApiProperty({ example: '10%' })
  @IsString()
  equityOffered: string;

  @ApiProperty({ example: '$15M' })
  @IsString()
  valuation: string;

  @ApiPropertyOptional({ example: '$2.2M' })
  @IsOptional()
  @IsString()
  arr?: string;

  @ApiPropertyOptional({ example: '120' })
  @IsOptional()
  @IsString()
  clients?: string;

  @ApiPropertyOptional({ example: 'https://cdn.ventureflow.io/decks/nexus-ai.pdf' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  pitchDeckUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  logo?: string;
}
