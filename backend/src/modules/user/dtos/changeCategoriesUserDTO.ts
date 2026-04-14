import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, ArrayNotEmpty } from 'class-validator';

export class ChangeCategoriesUserDTO {
  @ApiProperty({
    example: ['65f1a2b3c9d123456789abcd'],
    description: 'Lista de IDs de categorias',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  categories: string[];
}