import { IsString, IsOptional } from 'class-validator';

export class CreateGroupDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}