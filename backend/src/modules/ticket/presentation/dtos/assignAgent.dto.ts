import { IsString, IsUUID } from 'class-validator';

export class AssignAgentRequest {
  @IsUUID()
  @IsString()
  agentId: string;
}
