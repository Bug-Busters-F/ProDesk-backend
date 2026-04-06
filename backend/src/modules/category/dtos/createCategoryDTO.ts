import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateCategoryDTO {
  @ApiProperty({ example: 'WEB_APP' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: ['site', 'login'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ example: ['site não abre', 'erro no login'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trainingPhrases?: string[];

  @ApiPropertyOptional({ example: ['65f1a2b3c9d123456789abcd'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];
}
