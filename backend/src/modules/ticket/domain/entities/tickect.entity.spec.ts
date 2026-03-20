/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { randomUUID } from 'crypto';
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketEvents,
} from './tickect.entity';

describe('Ticket entity', () => {
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'Chamado para testes',
      category: TicketCategory.BI,
      priority: TicketPriority.LOW,
      description: 'Descrição do chamado para testes',
      clientId: randomUUID(),
    });
  });

  it('Ticket should be created with default parameters', () => {
    const primitiveTicket = ticket.toPrimitives();

    expect(ticket).toBeInstanceOf(Ticket);

    expect(ticket.status).toBe(TicketStatus.OPEN);
    expect(primitiveTicket.agentId).toBeNull();
    expect(primitiveTicket.groupId).toBeNull();
    expect(primitiveTicket.escalationLevel).toBe(1);

    expect(primitiveTicket.createdAt).toBeInstanceOf(Date);
    expect(primitiveTicket.updatedAt).toBeNull();
    expect(primitiveTicket.closedAt).toBeNull();

    expect(ticket.history.length).toBe(1);
    expect(ticket.history[0]).toMatchObject({
      event: TicketEvents.OPEN_NEW_TICKET,
      responsibleAgent: null,
      status: TicketStatus.OPEN,
      message: 'O chamado foi aberto.',
    });
  });

  it('assignToAgent should add event in history and update the fields: agentId, status and updateAt', () => {
    const newAgentId = randomUUID();

    ticket.assignToAgent(newAgentId);

    const primitiveTicket = ticket.toPrimitives();

    expect(primitiveTicket.agentId).toBe(newAgentId);
    expect(primitiveTicket.status).toBe(TicketStatus.IN_PROGRESS);

    expect(primitiveTicket.updatedAt).toBeInstanceOf(Date);
    expect(primitiveTicket.updatedAt).not.toBeNull();

    expect(ticket.history.length).toBe(2);
    expect(ticket.history[1]).toMatchObject({
      event: TicketEvents.NEW_AGENT,
      responsibleAgent: primitiveTicket.agentId,
      status: TicketStatus.IN_PROGRESS,
      message:
        'O chamado foi atribuido a um novo especialista que entrará em contato.',
    });
  });

  it('escalate should add event in history and update the fields: groupId, category, escalationLevel, status and updatedAt', () => {
    const newAgentId = randomUUID();
    ticket.assignToAgent(newAgentId);

    const newGroupId = randomUUID();
    ticket.escalate(newGroupId, TicketCategory.IA);
    const primitiveTicket = ticket.toPrimitives();

    expect(primitiveTicket.groupId).toBe(newGroupId);
    expect(primitiveTicket.category).toBe(TicketCategory.IA);
    expect(primitiveTicket.escalationLevel).toBe(2);
    expect(ticket.status).toBe(TicketStatus.ESCALATED);

    expect(primitiveTicket.updatedAt).toBeInstanceOf(Date);
    expect(primitiveTicket.updatedAt).not.toBeNull();

    expect(ticket.history.length).toBe(3);
    expect(ticket.history[2]).toMatchObject({
      event: TicketEvents.ESCALATE,
      responsibleAgent: newAgentId,
      status: TicketStatus.ESCALATED,
      message: 'O chamado foi escalado e um novo especialista o atenderá.',
    });
  });

  it('Should throw an error when escalating a ticket without a responsible agent', () => {
    expect(() => ticket.escalate(randomUUID(), TicketCategory.IOT)).toThrow(
      'The ticket should be related with an agent to be escalated.',
    );
  });

  it('Close a ticket should change the status and closedAt field, and add the event to history', () => {
    ticket.assignToAgent(randomUUID());
    ticket.close('Solução exemplo...');

    const primitiveTicket = ticket.toPrimitives();

    expect(primitiveTicket.closedAt).toBeInstanceOf(Date);
    expect(primitiveTicket.closedAt).not.toBeNull();

    expect(ticket.status).toBe(TicketStatus.CLOSED);

    expect(ticket.history[2]).toMatchObject({
      event: TicketEvents.CLOSE_TICKET,
      status: TicketStatus.CLOSED,
      message: 'O chamado foi fechado.',
      solution: 'Solução exemplo...',
    });
  });

  it('Should throw an error when closing a ticket with OPEN status', () => {
    expect(ticket.status).toBe(TicketStatus.OPEN);
    expect(() => ticket.close('Test solution')).toThrow(
      'A ticket only can be closed in progress status',
    );
  });

  it('Should throw an error when closing a ticket with ESCALATED status', () => {
    ticket.assignToAgent(randomUUID());
    ticket.escalate(randomUUID(), TicketCategory.WEB_APP);

    expect(ticket.status).toBe(TicketStatus.ESCALATED);
    expect(() => ticket.close('Test solution')).toThrow(
      'A ticket only can be closed in progress status',
    );
  });

  it('Should throw an error when closing a ticket with an empty solution', () => {
    ticket.assignToAgent(randomUUID());

    expect(() => ticket.close('  ')).toThrow('The solution cannot be empty.');
  });
});
