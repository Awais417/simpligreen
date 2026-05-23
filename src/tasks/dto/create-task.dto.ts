import { IsString, IsInt, IsUUID, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 1, description: 'Execution order (1 = first)' })
  @IsInt()
  @Min(1)
  sequenceNumber: number;

  @ApiProperty({ description: 'UUID of the Installer assigned to this task' })
  @IsUUID()
  installerId: string;

  @ApiPropertyOptional({ description: 'UUID of the Installer Type' })
  @IsOptional()
  @IsUUID()
  installerTypeId?: string;

  @ApiProperty({ example: 'Install scaffolding on the north face of the building.' })
  @IsString()
  @MaxLength(2000)
  description: string;
}
