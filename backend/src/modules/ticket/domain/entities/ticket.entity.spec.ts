/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { randomUUID } from 'crypto';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketEvents,
  TicketEventMessage,
  TicketValidationErrors,
} from './ticket.entity';

describe('Ticket entity', () => {
  let ticket: Ticket;

  beforeEach(() => {
    ticket = Ticket.create({
      title: 'Chamado para testes',
      category: 'bi',
      description: 'Descrição do chamado para testes',
      clientId: randomUUID(),
    });
  });

  it('Ticket should be created with default parameters', () => {
    expect(ticket).toBeInstanceOf(Ticket);
    expect(ticket.status).toBe(TicketStatus.OPEN);
    expect(ticket.history.length).toBe(1);
    expect(ticket.history[0]).toMatchObject({
      event: TicketEvents.OPEN_NEW_TICKET,
      responsibleAgent: null,
      status: TicketStatus.OPEN,
      message: TicketEventMessage.OPEN_NEW_TICKET_MSG,
    });

    const primitiveTicket = ticket.toPrimitives();

    expect(primitiveTicket.status).toBe(TicketStatus.OPEN);
    expect(primitiveTicket.agentId).toBeNull();
    expect(primitiveTicket.groupId).toBeNull();
    expect(primitiveTicket.escalationLevel).toBe(1);
    expect(primitiveTicket.createdAt).toBeInstanceOf(Date);
    expect(primitiveTicket.updatedAt).toBeNull();
    expect(primitiveTicket.closedAt).toBeNull();
    expect(primitiveTicket.priority).toBe(TicketPriority.LOW);
  });

  it('assignToAgent should add event in history and update the fields: agentId, status and updateAt', () => {
    const newAgentId = randomUUID();

    ticket.assignToAgent(newAgentId);
    const primitiveTicket = ticket.toPrimitives();

    expect(ticket.history.length).toBe(2);
    expect(ticket.history[1]).toMatchObject({
      event: TicketEvents.NEW_AGENT,
      responsibleAgent: { id: newAgentId, name: '' },
      status: TicketStatus.IN_PROGRESS,
      message: TicketEventMessage.NEW_AGENT_MSG,
    });

    expect(ticket.agentId).toBe(newAgentId);
    expect(primitiveTicket.status).toBe(TicketStatus.IN_PROGRESS);
    expect(primitiveTicket.updatedAt).toBeInstanceOf(Date);
    expect(primitiveTicket.updatedAt).not.toBeNull();
  });

  it('escalate should add event in history and update the fields: groupId, category, escalationLevel, status and updatedAt', () => {
    const newAgentId = randomUUID();
    ticket.assignToAgent(newAgentId);

    const newGroupId = randomUUID();
    ticket.escalate(newGroupId, 'ia');

    expect(ticket.agentId).toBe(null);
    expect(ticket.status).toBe(TicketStatus.ESCALATED);
    expect(ticket.history.length).toBe(3);
    expect(ticket.history[2]).toMatchObject({
      event: TicketEvents.ESCALATE,
      responsibleAgent: null,
      status: TicketStatus.ESCALATED,
      message: TicketEventMessage.ESCALATE_MSG,
    });

    const primitiveTicket = ticket.toPrimitives();

    expect(primitiveTicket.groupId).toBe(newGroupId);
    expect(primitiveTicket.category).toBe('ia');
    expect(primitiveTicket.escalationLevel).toBe(1);
    expect(primitiveTicket.updatedAt).toBeInstanceOf(Date);
    expect(primitiveTicket.updatedAt).not.toBeNull();
  });

  it('Should throw an error when escalating a ticket without a responsible agent', () => {
    expect(() => ticket.escalate(randomUUID(), 'iot')).toThrow(
      TicketValidationErrors.ECALATE_WITH_NO_AGENT_ERROR,
    );
  });

  it('Close a ticket should change the status and closedAt field, and add the event to history', () => {
    ticket.assignToAgent(randomUUID());
    ticket.close('Solução exemplo...');
    expect(ticket.status).toBe(TicketStatus.CLOSED);

    expect(ticket.history[2]).toMatchObject({
      event: TicketEvents.CLOSE_TICKET,
      status: TicketStatus.CLOSED,
      message: TicketEventMessage.CLOSE_TICKET_MSG,
      solution: 'Solução exemplo...',
    });

    const primitiveTicket = ticket.toPrimitives();

    expect(primitiveTicket.closedAt).toBeInstanceOf(Date);
    expect(primitiveTicket.closedAt).not.toBeNull();
  });

  it('Should throw an error when closing a ticket with OPEN status', () => {
    expect(ticket.status).toBe(TicketStatus.OPEN);
    expect(() => ticket.close('Test solution')).toThrow(
      TicketValidationErrors.CLOSE_WITH_WRONG_STATUS_ERROR,
    );
  });

  it('Should throw an error when closing a ticket with ESCALATED status', () => {
    ticket.assignToAgent(randomUUID());
    ticket.escalate(randomUUID(), 'web_app');

    expect(ticket.status).toBe(TicketStatus.ESCALATED);
    expect(() => ticket.close('Test solution')).toThrow(
      TicketValidationErrors.CLOSE_WITH_WRONG_STATUS_ERROR,
    );
  });

  it('Should throw an error when closing a ticket with an empty solution', () => {
    ticket.assignToAgent(randomUUID());

    expect(() => ticket.close('  ')).toThrow(
      TicketValidationErrors.CLOSE_WITH_NO_SOLUTION_ERROR,
    );
  });
});
