import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReassignTaskDto {
  @ApiProperty({ description: 'UUID of the new Installer' })
  @IsUUID()
  installerId: string;
}
