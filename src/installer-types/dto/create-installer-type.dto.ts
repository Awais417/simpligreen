import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstallerTypeDto {
  @ApiProperty({ example: 'Electrician' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  requiresCertificate?: boolean;
}
