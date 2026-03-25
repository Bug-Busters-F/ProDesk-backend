import { ApiProperty} from '@nestjs/swagger';
import { IsString, Length} from 'class-validator';

export class CreateCompanyDTO {
  @ApiProperty({ example: 'Tech Solutions' })
  @IsString()
  name: string;

  @ApiProperty({ example: '12345678000199', minLength: 14, maxLength: 14 })
  @IsString()
  @Length(14, 14)
  cnpj: string;
}