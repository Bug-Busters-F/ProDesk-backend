import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class AssignAgentRequest {
  @ApiProperty({ example: randomUUID(), description: 'ID do agente' })
  @IsUUID()
  @IsString()
  agentId!: string;
}
