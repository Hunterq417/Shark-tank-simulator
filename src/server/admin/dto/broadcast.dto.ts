import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class BroadcastDto {
  @ApiProperty({ example: 'Live pitch starting in 5 minutes' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ example: 'All sharks should return to the main stage.' })
  @IsString()
  @MinLength(2)
  message: string;
}
