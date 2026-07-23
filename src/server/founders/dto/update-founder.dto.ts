import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateFounderDto {
  @ApiPropertyOptional({ example: 'Serial founder focused on climate infrastructure.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Attach this founder to a startup profile' })
  @IsOptional()
  @IsUUID()
  startupId?: string;
}
