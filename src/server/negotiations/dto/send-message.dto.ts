import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'We can move on valuation if you take the board seat.' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiPropertyOptional({ enum: ['Founder', 'Investor', 'System'] })
  @IsOptional()
  @IsIn(['Founder', 'Investor', 'System'])
  senderRole?: string;
}
