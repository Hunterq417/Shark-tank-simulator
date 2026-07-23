import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNegotiationDto {
  @ApiProperty()
  @IsUUID()
  offerId: string;

  @ApiPropertyOptional({ example: 'ROOM-101' })
  @IsOptional()
  @IsString()
  roomCode?: string;
}
