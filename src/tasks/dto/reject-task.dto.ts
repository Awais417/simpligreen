import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectTaskDto {
  @ApiProperty({ example: 'Scaffold is unstable. Please redo sections 3 and 4.' })
  @IsString()
  @MinLength(5)
  comments: string;

  @ApiPropertyOptional({ description: 'New installer UUID to reassign (leave empty to keep same installer)' })
  @IsOptional()
  @IsUUID()
  newInstallerId?: string;
}
