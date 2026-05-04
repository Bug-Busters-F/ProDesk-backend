import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadChatFileParamsDTO {

  @ApiProperty({
    example: '8156f5c6-9b82-4be9-881e-641082d0bb56'
  })
  @IsString()
  chatId: string;

}