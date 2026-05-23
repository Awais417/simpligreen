import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ example: 'Rooftop Solar Installation' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Full installation of 20 solar panels on roof.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'UUID of assigned Manager' })
  @IsUUID()
  managerId: string;

  @ApiProperty({ description: 'UUID of assigned QA Engineer' })
  @IsUUID()
  qaId: string;
}
