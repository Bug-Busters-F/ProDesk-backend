// Enum types to assist in typing of entity strucuture

import { randomUUID } from 'crypto';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketCategory {
  WEB_APP = 'WEB_APP',
  IA = 'ARTIFICIAL_INTELLIGENCE',
  BI = 'BUSINESS_INTELLIGENCE',
  IOT = 'INTERNET_OF_THINGS',
}

export enum TicketEvents {
  OPEN_NEW_TICKET = 'OPEN_NEW_TICKET',
  ESCALATE = 'ESCALATE',
  NEW_AGENT = 'NEW_AGENT',
  CLOSE_TICKET = 'CLOSE_TICKET',
}

type TicketHistoryEvent = {
  event: TicketEvents;
  responsibleAgent: string | null;
  status: TicketStatus;
  message: string;
  solution?: string | null;
  createdAt: Date;
};

export class Ticket {
  // Strutucture definition
  private _id: string;

  private _status: TicketStatus = TicketStatus.OPEN;
  private agentId: string | null = null;
  private groupId: string | null = null;
  private escalationLevel: number = 1;
  private fileUrls: string[] = [];

  private createdAt: Date = new Date();
  private updatedAt: Date | null = null;
  private closedAt: Date | null = null;

  private _history: TicketHistoryEvent[] = [];

  constructor(
    private title: string,
    private category: TicketCategory,
    private priority: TicketPriority,
    private description: string,
    private readonly clientId: string,
  ) {}

  // Getters (only properties which domain should expose)
  get id() {
    return this._id;
  }

  get status() {
    return this._status;
  }

  get history() {
    return this._history;
  }

  // Function to create a new ticket instance
  static create(props: {
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    clientId: string;
  }): Ticket {
    const ticket = new Ticket(
      props.title,
      props.category,
      props.priority,
      props.description,
      props.clientId,
    );

    ticket._id = randomUUID();
    ticket.createdAt = new Date();

    ticket.addHistory({
      event: TicketEvents.OPEN_NEW_TICKET,
      responsibleAgent: null,
      status: TicketStatus.OPEN,
      message: 'O chamado foi aberto.',
    });

    return ticket;
  }

  // Restore function to convert an object into a ticket instance
  static restore(props: {
    id: string;
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    description: string;
    fileUrls?: string[];
    status: TicketStatus;
    clientId: string;
    agentId?: string;
    groupId?: string;
    escalationLevel: number;
    history: TicketHistoryEvent[];
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
  }): Ticket {
    const ticket = new Ticket(
      props.title,
      props.category,
      props.priority,
      props.description,
      props.clientId,
    );

    ticket._id = props.id;

    ticket.agentId = props.agentId ?? null;
    ticket.groupId = props.groupId ?? null;
    ticket.fileUrls = props.fileUrls ?? [];

    ticket._status = props.status;
    ticket.escalationLevel = props.escalationLevel;

    ticket._history = props.history;

    ticket.createdAt = props.createdAt;
    ticket.updatedAt = props.updatedAt;
    ticket.closedAt = props.closedAt ?? null;

    return ticket;
  }

  // Convert a ticket instance into an object
  toPrimitives() {
    return {
      id: this._id,
      title: this.title,
      category: this.category,
      priority: this.priority,
      description: this.description,
      clientId: this.clientId,
      fileUrls: this.fileUrls,
      status: this.status,
      agentId: this.agentId,
      groupId: this.groupId,
      escalationLevel: this.escalationLevel,
      history: this.history,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      closedAt: this.closedAt,
    };
  }

  // Updates the updatedAt field whenever an action is performed
  private touch() {
    this.updatedAt = new Date();
  }

  // Appends a new event to the ticket history
  private addHistory(props: {
    event: TicketEvents;
    responsibleAgent: string | null;
    status: TicketStatus;
    message: string;
    solution?: string | null;
  }): void {
    this._history.push({
      ...props,
      createdAt: new Date(),
    });
  }

  //  Assigns a new responsible agent to the ticket
  assignToAgent(agentId: string): void {
    this.touch();

    this.agentId = agentId;
    this._status = TicketStatus.IN_PROGRESS;

    this.addHistory({
      event: TicketEvents.NEW_AGENT,
      responsibleAgent: this.agentId,
      status: TicketStatus.IN_PROGRESS,
      message:
        'O chamado foi atribuido a um novo especialista que entrará em contato.',
    });
  }

  // Escalates the ticket to a new responsible group and optionally changes the category
  escalate(groupId: string, category?: TicketCategory): void {
    if (!this.agentId) {
      throw new Error(
        'The ticket must be assigned to an agent before being escalated.',
      );
    }

    this.touch();

    this.groupId = groupId;
    this.category = category ?? this.category;
    this.escalationLevel++;
    this._status = TicketStatus.ESCALATED;

    this.addHistory({
      event: TicketEvents.ESCALATE,
      responsibleAgent: this.agentId,
      status: TicketStatus.ESCALATED,
      message: 'O chamado foi escalado e um novo especialista o atenderá.',
    });
  }
  // Function to close the ticket and register the solution
  close(solution: string): void {
    if (this.status !== TicketStatus.IN_PROGRESS) {
      throw new Error('A ticket can only be closed when in progress status');
    }

    if (!solution.trim()) {
      throw new Error('The solution cannot be empty.');
    }

    this.touch();

    this._status = TicketStatus.CLOSED;
    this.closedAt = new Date();

    this.addHistory({
      event: TicketEvents.CLOSE_TICKET,
      responsibleAgent: this.agentId,
      status: TicketStatus.CLOSED,
      message: 'O chamado foi fechado.',
      solution: solution,
    });
  }
}
