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

export enum TicketCategory {
  WEB_APP = 'WEB_APP',
  IA = 'ARTIFICIAL_INTELLIGENCE',
  BI = 'BUSINESS_INTELLIGENCE',
  IOT = 'INTERNET_OF_THINGS',
}

export enum TicketEvents {
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
  // Strutucture's definition
  private _id: string;

  private _status: TicketStatus = TicketStatus.OPEN;
  private agentId: string | null = null;
  private groupId: string | null = null;
  private escalationLevel: number = 1;
  private fileUrls: string[] = [];

  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();
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

  // Restore method to convert a object into a ticket instance
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

    ticket.createdAt = props.createdAt;
    ticket.updatedAt = props.updatedAt;
    ticket.closedAt = props.closedAt ?? null;

    return ticket;
  }

  private touch() {
    this.updatedAt = new Date();
  }

  private addHistory(props: {
    event: TicketEvents;
    responsibleAgent: string | null;
    status: TicketStatus;
    message: string;
    solution?: string | null;
  }): void {
    this._history.push({ ...props, createdAt: new Date() });
  }

  assignToAgent(agentId: string): void {
    this.agentId = agentId;
    this._status = TicketStatus.IN_PROGRESS;
    this.touch();

    this.addHistory({
      event: TicketEvents.NEW_AGENT,
      responsibleAgent: this.agentId,
      status: TicketStatus.IN_PROGRESS,
      message:
        'O chamado foi atribuido a um novo especialista que entrará em contato.',
    });
  }

  assignToGroup(groupId: string): void {
    this.groupId = groupId;
  }

  escalate(groupId: string, category?: TicketCategory): void {
    this.assignToGroup(groupId);
    this.category = category ?? this.category;
    this.escalationLevel++;
    this._status = TicketStatus.ESCALATED;
    this.touch();

    this.addHistory({
      event: TicketEvents.ESCALATE,
      responsibleAgent: this.agentId,
      status: TicketStatus.ESCALATED,
      message: 'O chamado foi escalado e um novo especialista o atenderá',
    });
  }

  close(solution: string): void {
    this._status = TicketStatus.CLOSED;
    this.closedAt = new Date();
    this.touch();

    this.addHistory({
      event: TicketEvents.CLOSE_TICKET,
      responsibleAgent: this.agentId,
      status: TicketStatus.CLOSED,
      message: 'O chamado foi fechado.',
      solution: solution,
    });
  }
}
