import { IsString, IsOptional } from 'class-validator';

export class UpdateGroupDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}