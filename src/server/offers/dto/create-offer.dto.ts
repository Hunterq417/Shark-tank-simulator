import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty()
  @IsUUID()
  startupId: string;

  @ApiProperty({ example: '$500K' })
  @IsString()
  amount: string;

  @ApiProperty({ example: '3.5%' })
  @IsString()
  equity: string;

  @ApiPropertyOptional({ example: '$25,000,000' })
  @IsOptional()
  @IsString()
  valuation?: string;

  @ApiPropertyOptional({ example: 'Pro-Rata & Board Observer Rights' })
  @IsOptional()
  @IsString()
  terms?: string;
}
