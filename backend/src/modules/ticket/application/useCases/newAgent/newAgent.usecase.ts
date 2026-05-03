import { Injectable } from '@nestjs/common';
import { TicketStatus } from '../../../domain/entities/ticket.entity';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { ChatService } from '../../../../chat/application/chat.service';
import { UserService } from '../../../../user/user.service';
import { UserRole } from '../../../../shared/enums/user.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export interface NewAgentTicketInput {
  id: string;
  agentId: string;
}

export interface NewAgentTicketOutput {
  id: string;
  agentId: string | null;
  status: TicketStatus;
}

@Injectable()
export class NewAgentTicketUseCase {
  constructor(
    private readonly repository: ITicketRepository,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  async execute(input: NewAgentTicketInput): Promise<NewAgentTicketOutput> {
    const foundedTicket = await this.repository.readById(input.id);

    if (!foundedTicket) {
      throw new NotFoundException('Ticket not found.');
    }

    const user = await this.userService.findById(input.agentId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.role === UserRole.SUPPORT) {
      const userLevel = user.level || 1;
      const ticketLevel = foundedTicket.level || 1;

      if (userLevel !== ticketLevel) {
        throw new ForbiddenException(`You do not have the exact required level (${ticketLevel}) to assign this ticket.`);
      }

      const ticketCategory = foundedTicket.ticketCategory.toString();
      const hasCategory = user.categories?.some((cat) => cat.name === ticketCategory || cat.id?.toString() === ticketCategory || cat.id === ticketCategory);
      if (!hasCategory) {
        throw new ForbiddenException('You do not belong to the sector of this ticket.');
      }
    }

    foundedTicket.assignToAgent(input.agentId);

    const updatedTicket = await this.repository.save(foundedTicket);

    if (!updatedTicket) {
      throw new Error('Fail to update ticket.');
    }

    try {
      await this.chatService.updateAgentByTicketId(updatedTicket.id, updatedTicket.agentId);
    } catch (e) {
      // Ignora se o chat não existir, pois os módulos estão fracamente acoplados
      console.warn('Chat não pôde ser atualizado ou não existe:', e);
    }

    return {
      id: updatedTicket.id,
      agentId: updatedTicket.agentId,
      status: updatedTicket.status,
    };
  }
}
