import { IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class AssignAgentRequest {
  @ApiProperty({ example: randomUUID(), description: 'ID do agente' })
  @IsMongoId()
  @IsString()
  agentId!: string;
}
