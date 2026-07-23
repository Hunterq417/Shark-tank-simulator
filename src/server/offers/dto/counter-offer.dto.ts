import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CounterOfferDto {
  @ApiProperty({ example: '$650K' })
  @IsString()
  amount: string;

  @ApiProperty({ example: '5%' })
  @IsString()
  equity: string;

  @ApiPropertyOptional({ example: 'Adjusted valuation term sheet' })
  @IsOptional()
  @IsString()
  terms?: string;
}
