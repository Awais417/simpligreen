import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QaDecisionDto {
  @ApiPropertyOptional({ example: 'All tasks verified and compliant.' })
  @IsOptional()
  @IsString()
  comments?: string;
}
