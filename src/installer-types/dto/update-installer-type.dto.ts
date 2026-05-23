import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInstallerTypeDto {
  @ApiPropertyOptional({ example: 'Gas Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresCertificate?: boolean;
}
