import { ObjectId } from 'mongoose';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
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

export class Ticket {
  private status: TicketStatus = TicketStatus.OPEN;
  private agentId: string | null = null;
  private groupId: string | null = null;
  private escalationLevel: number = 1;
  private fileUrls: string[] = [];

  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();
  private closedAt: Date | null = null;

  constructor(
    private title: string,
    private category: TicketCategory,
    private priority: TicketPriority,
    private description: string,
    private readonly clientId: string,
  ) {}
}
