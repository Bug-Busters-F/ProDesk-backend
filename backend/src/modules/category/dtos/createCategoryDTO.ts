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
}
