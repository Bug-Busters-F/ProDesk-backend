import { IsString, IsOptional, Length } from 'class-validator';

export class UpdateCompanyDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(14, 14)
  cnpj?: string;
}