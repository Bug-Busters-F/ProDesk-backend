import { randomUUID } from 'crypto';

// Enum types to assist in typing of entity strucuture

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

export enum TicketEvents {
  OPEN_NEW_TICKET = 'OPEN_NEW_TICKET',
  ESCALATE = 'ESCALATE',
  NEW_AGENT = 'NEW_AGENT',
  CLOSE_TICKET = 'CLOSE_TICKET',
}

export enum TicketEventMessage {
  OPEN_NEW_TICKET_MSG = 'O chamado foi aberto.',
  NEW_AGENT_MSG = 'O chamado foi atribuido a um novo especialista que entrará em contato.',
  ESCALATE_MSG = 'O chamado foi escalado e um novo especialista o atenderá.',
  CLOSE_TICKET_MSG = 'O chamado foi fechado',
}

export enum TicketValidationErrors {
  ECALATE_WITH_NO_AGENT_ERROR = 'The ticket must be assigned to an agent before being escalated.',
  CLOSE_WITH_WRONG_STATUS_ERROR = 'A ticket can only be closed when in progress status.',
  CLOSE_WITH_NO_SOLUTION_ERROR = 'The solution cannot be empty.',
}

export type TicketHistoryEntry = {
  event: TicketEvents;
  responsibleAgent: string | null;
  status: TicketStatus;
  message: string;
  solution?: string | null;
  occurredAt: Date;
};

export class Ticket {
  // Strutucture definition
  private _id: string;

  private _status: TicketStatus = TicketStatus.OPEN;
  private _agentId: string | null = null;
  private _groupId: string | null = null;
  private escalationLevel: number = 1;
  private attachmentsUrls: string[] = [];
  private priority = TicketPriority.LOW;

  private createdAt: Date = new Date();
  private updatedAt: Date | null = null;
  private closedAt: Date | null = null;

  private _history: TicketHistoryEntry[] = [];

  constructor(
    private title: string,
    private category: string,
    private description: string,
    private readonly _clientId: string,
  ) {}

  // Getters (only properties which domain should expose)
  get id() {
    return this._id;
  }

  get agentId() {
    return this._agentId;
  }

  get groupId() {
    return this._groupId;
  }

  get clientId() {
    return this._clientId;
  }

  get status() {
    return this._status;
  }

  get history(): readonly TicketHistoryEntry[] {
    return [...this._history];
  }

  // Function to create a new ticket instance
  static create(props: {
    title: string;
    category: string;
    description: string;
    clientId: string;
  }): Ticket {
    const ticket = new Ticket(
      props.title,
      props.category,
      props.description,
      props.clientId,
    );

    ticket._id = randomUUID();
    ticket.createdAt = new Date();

    ticket.addHistory({
      event: TicketEvents.OPEN_NEW_TICKET,
      responsibleAgent: null,
      status: TicketStatus.OPEN,
      message: TicketEventMessage.OPEN_NEW_TICKET_MSG,
    });

    return ticket;
  }

  // Restore function to convert an object into a ticket instance
  static restore(props: {
    _id: string;
    title: string;
    category: string;
    priority: TicketPriority;
    description: string;
    fileUrls?: string[];
    status: TicketStatus;
    clientId: string;
    agentId?: string;
    groupId?: string;
    escalationLevel: number;
    history: TicketHistoryEntry[];
    createdAt: Date;
    updatedAt?: Date | null;
    closedAt?: Date;
  }): Ticket {
    const ticket = new Ticket(
      props.title,
      props.category,
      props.description,
      props.clientId,
    );

    ticket._id = props._id;

    ticket.priority = TicketPriority.LOW;

    ticket._agentId = props.agentId ?? null;
    ticket._groupId = props.groupId ?? null;
    ticket.attachmentsUrls = props.fileUrls ?? [];

    ticket._status = props.status;
    ticket.escalationLevel = props.escalationLevel;

    ticket._history = props.history;

    ticket.createdAt = props.createdAt;
    ticket.updatedAt = props.updatedAt ?? null;
    ticket.closedAt = props.closedAt ?? null;

    return ticket;
  }

  // Convert a ticket instance into an object
  toPrimitives() {
    return {
      _id: this._id,
      title: this.title,
      category: this.category,
      priority: this.priority,
      description: this.description,
      clientId: this._clientId,
      fileUrls: this.attachmentsUrls,
      status: this.status,
      agentId: this._agentId,
      groupId: this._groupId,
      escalationLevel: this.escalationLevel,
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
      occurredAt: new Date(),
    });
  }

  //  Assigns a new responsible agent to the ticket
  assignToAgent(agentId: string): void {
    this.touch();

    this._agentId = agentId;
    this._status = TicketStatus.IN_PROGRESS;

    this.addHistory({
      event: TicketEvents.NEW_AGENT,
      responsibleAgent: this._agentId,
      status: TicketStatus.IN_PROGRESS,
      message: TicketEventMessage.NEW_AGENT_MSG,
    });
  }

  // Escalates the ticket to a new responsible group and optionally changes the category
  escalate(groupId: string, category?: string): void {
    if (!this._agentId) {
      throw new Error(TicketValidationErrors.ECALATE_WITH_NO_AGENT_ERROR);
    }

    this.touch();

    this._groupId = groupId;
    this.category = category ?? this.category;
    this.escalationLevel++;
    this._status = TicketStatus.ESCALATED;

    this.addHistory({
      event: TicketEvents.ESCALATE,
      responsibleAgent: this._agentId,
      status: TicketStatus.ESCALATED,
      message: TicketEventMessage.ESCALATE_MSG,
    });
  }

  // Function to close the ticket and register the solution
  close(solution: string): void {
    if (this.status !== TicketStatus.IN_PROGRESS) {
      throw new Error(TicketValidationErrors.CLOSE_WITH_WRONG_STATUS_ERROR);
    }

    if (!solution.trim()) {
      throw new Error(TicketValidationErrors.CLOSE_WITH_NO_SOLUTION_ERROR);
    }

    this.touch();

    this._status = TicketStatus.CLOSED;
    this.closedAt = new Date();

    this.addHistory({
      event: TicketEvents.CLOSE_TICKET,
      responsibleAgent: this._agentId,
      status: TicketStatus.CLOSED,
      message: TicketEventMessage.CLOSE_TICKET_MSG,
      solution: solution,
    });
  }
}
