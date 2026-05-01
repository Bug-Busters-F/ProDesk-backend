import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateFaqRequest {
    @ApiProperty({ example: 'Como abrir um chamado?' , description: 'Pergunta do FAQ'})
    @IsString()
    @IsNotEmpty()
    question!: string;

    @ApiProperty({ 
        example: 'Acesse o menu chamados e clique em novo chamado.',
        description: 'Resposta do FAQ'
    })
    @IsString()
    @IsNotEmpty()
    answer!: string;
}