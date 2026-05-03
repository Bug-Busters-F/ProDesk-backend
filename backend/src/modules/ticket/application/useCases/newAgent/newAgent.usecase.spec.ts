/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import {
  Ticket,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';
import { NewAgentTicketUseCase } from './newAgent.usecase';
import { ChatService } from '../../../../chat/application/chat.service';
import { UserService } from '../../../../user/user.service';
import { UserRole } from '../../../../shared/enums/user.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('NewAgentTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let chatService: jest.Mocked<ChatService>;
  let userService: jest.Mocked<UserService>;
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

    chatService = {
      updateAgentByTicketId: jest.fn(),
    } as unknown as jest.Mocked<ChatService>;

    userService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    useCase = new NewAgentTicketUseCase(repository, chatService, userService);
  });

  it('should assign a new agent to a ticket successfully as ADMIN', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    repository.readById.mockResolvedValue(ticket);
    userService.findById.mockResolvedValue({
      id: input.agentId,
      role: UserRole.ADMIN,
    } as any);

    ticket.assignToAgent(input.agentId);
    repository.save.mockResolvedValue(ticket);

    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(output.id).toBe(ticket.id);
    expect(output.agentId).toBe(input.agentId);
    expect(output.status).toBe(TicketStatus.IN_PROGRESS);
  });

  it('should assign a new agent to a ticket successfully as SUPPORT with correct level and sector', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    repository.readById.mockResolvedValue(ticket);
    userService.findById.mockResolvedValue({
      id: input.agentId,
      role: UserRole.SUPPORT,
      level: 1,
      categories: [{ id: 'bi', name: 'bi' }],
    } as any);

    ticket.assignToAgent(input.agentId);
    repository.save.mockResolvedValue(ticket);

    const output = await useCase.execute(input);

    expect(output).toBeDefined();
    expect(output.agentId).toBe(input.agentId);
  });

  it('should fail if SUPPORT agent level is different from ticket escalationLevel (e.g. lower)', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    const escalatedTicket = Object.assign(Object.create(Object.getPrototypeOf(ticket)), ticket);
    escalatedTicket.escalationLevel = 3;

    repository.readById.mockResolvedValue(escalatedTicket);
    userService.findById.mockResolvedValue({
      id: input.agentId,
      role: UserRole.SUPPORT,
      level: 1,
      categories: [{ id: 'bi', name: 'bi' }],
    } as any);

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
  });

  it('should fail if SUPPORT agent level is different from ticket escalationLevel (e.g. higher)', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    const escalatedTicket = Object.assign(Object.create(Object.getPrototypeOf(ticket)), ticket);
    escalatedTicket.escalationLevel = 1;

    repository.readById.mockResolvedValue(escalatedTicket);
    userService.findById.mockResolvedValue({
      id: input.agentId,
      role: UserRole.SUPPORT,
      level: 2,
      categories: [{ id: 'bi', name: 'bi' }],
    } as any);

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
  });

  it('should fail if SUPPORT agent does not belong to the ticket category', async () => {
    const input = {
      id: ticket.id,
      agentId: randomUUID(),
    };

    repository.readById.mockResolvedValue(ticket); // category is 'bi'
    userService.findById.mockResolvedValue({
      id: input.agentId,
      role: UserRole.SUPPORT,
      level: 1,
      categories: [{ id: 'infra', name: 'infra' }], // different category
    } as any);

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenException);
  });
});
