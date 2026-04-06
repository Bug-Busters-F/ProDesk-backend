import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateCategoryDTO {
  @ApiPropertyOptional({ example: 'WEB_APP_UPDATED' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: ['novo', 'exemplo'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ example: ['novo texto de treino'] })
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
