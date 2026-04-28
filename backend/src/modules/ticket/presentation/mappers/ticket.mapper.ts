import { CreateTicketInput } from '../../application/useCases/create/create.usecase';
import { EscalateTicketInput } from '../../application/useCases/escalate/escalate.usecase';
import { NewAgentTicketInput } from '../../application/useCases/newAgent/newAgent.usecase';
import { AssignAgentRequest } from '../dtos/assignAgent.dto';
import { CreateTicketRequest } from '../dtos/create.dto';
import { EscalateTicketRequest } from '../dtos/escalateTicket.dto';

export class TicketMapper {
  static toCreateInput(req: CreateTicketRequest): CreateTicketInput {
    return {
      title: req.title,
      description: req.description,
      clientId: req.clientId,
      level: req.level
    };
  }

  static toNewAgentInput(
    id: string,
    req: AssignAgentRequest,
  ): NewAgentTicketInput {
    return {
      id: id,
      agentId: req.agentId,
    };
  }

  static toEscalateTicketInput(
    id: string,
    req: EscalateTicketRequest,
  ): EscalateTicketInput {
    return {
      id: id,
      groupId: req.groupId,
      category: req.category,
      whatWasDone: req.whatWasDone
    };
  }
}
