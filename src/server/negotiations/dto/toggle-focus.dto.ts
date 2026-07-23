import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleFocusDto {
  @ApiProperty()
  @IsBoolean()
  focusMode: boolean;
}
