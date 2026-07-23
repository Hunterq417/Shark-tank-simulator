import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Demo Day: Winter Cohort' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Nexus AI' })
  @IsString()
  companyName: string;

  @ApiProperty({ description: 'Startup this pitch event is for' })
  @IsUUID()
  startupId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  pitchDeckUrl?: string;
}
