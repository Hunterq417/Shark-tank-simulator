import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateNegotiationStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'ACCEPTED', 'REJECTED'] })
  @IsIn(['ACTIVE', 'ACCEPTED', 'REJECTED'])
  status: 'ACTIVE' | 'ACCEPTED' | 'REJECTED';
}
