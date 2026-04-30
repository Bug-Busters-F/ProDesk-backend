import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateFaqRequest {
    @ApiPropertyOptional({ example: 'Como abrir um chamado?' , description: 'Pergunta do FAQ' })
    @IsOptional()
    @IsString()
    question?: string;

    @ApiPropertyOptional({
        example: 'Acesse o menu de chamados e clique em novo chamado.',
        description: 'Resposta do FAQ'
    })
    @IsOptional()
    @IsString()
    answer?: string;
}