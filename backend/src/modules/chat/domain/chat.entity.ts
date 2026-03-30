export enum ChatStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ChatDetails {
  id: string;
  ticketId: string;
  clientId: string;
  attendantId: string;
  status: ChatStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
