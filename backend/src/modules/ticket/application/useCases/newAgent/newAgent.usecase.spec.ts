/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { Ticket, TicketStatus } from '../../../domain/entities/ticket.entity';
import { NewAgentTicketUseCase } from './newAgent.usecase';
import type { IChatRepository } from '../../../../chat/domain/chat.repository';

describe('NewAgentTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let chatRepository: jest.Mocked<IChatRepository>; 
  let useCase: NewAgentTicketUseCase;
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'titulo do ticket',
      category: 'bi',
      description: 'descricao do ticket',
      clientId: randomUUID(),
    });

    repository = {
      readById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    chatRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByParticipant: jest.fn(),
      findByTicketId: jest.fn(),
      updateStatus: jest.fn(),
      addAgentToChat: jest.fn(),
    } as unknown as jest.Mocked<IChatRepository>;

    useCase = new NewAgentTicketUseCase(repository, chatRepository);
  });

  it('should assign a new agent to a ticket successfully and create a chat if it does not exist', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    repository.readById.mockResolvedValue(ticket);
    ticket.assignToAgent(input.agentId);
    repository.save.mockResolvedValue(ticket);

    chatRepository.findByTicketId.mockResolvedValue(null);
    chatRepository.create.mockResolvedValue({} as any);

    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);
    expect(output.agentId).toBe(input.agentId);
    expect(output.status).toBe(TicketStatus.IN_PROGRESS);

    expect(repository.readById).toHaveBeenCalledTimes(1);
    expect(repository.readById).toHaveBeenCalledWith(input.id);
    expect(repository.save).toHaveBeenCalledTimes(1);

    expect(chatRepository.findByTicketId).toHaveBeenCalledTimes(1);
    expect(chatRepository.findByTicketId).toHaveBeenCalledWith(input.id);
    expect(chatRepository.create).toHaveBeenCalledTimes(1);

    expect(output).not.toHaveProperty('toPrimitives');
    expect(output).not.toHaveProperty('escalate');
    expect(output).not.toHaveProperty('assignToAgent');
  });

  it('should assign a new agent to a ticket and add the agent to the existing chat', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    repository.readById.mockResolvedValue(ticket);
    ticket.assignToAgent(input.agentId);
    repository.save.mockResolvedValue(ticket);
    chatRepository.findByTicketId.mockResolvedValue({ id: 'chat-uuid-123' } as any);

    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(chatRepository.findByTicketId).toHaveBeenCalledWith(input.id);
    
    expect(chatRepository.addAgentToChat).toHaveBeenCalledWith(input.id, input.agentId);
    expect(chatRepository.create).not.toHaveBeenCalled();
  });
});