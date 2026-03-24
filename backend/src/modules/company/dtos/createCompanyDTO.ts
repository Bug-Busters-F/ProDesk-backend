import { IsString, Length } from 'class-validator';

export class CreateCompanyDTO {
  @IsString()
  name: string;

  @IsString()
  @Length(14, 14)
  cnpj: string;
}