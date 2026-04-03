export enum ChatStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface ChatDetails {
  id: string;
  ticketId: string;
  clientId: string;
  agentId: string;
  groupId: string;
  status: ChatStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
