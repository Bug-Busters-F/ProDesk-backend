import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';

export class DeleteTicketUseCase {
  constructor(private readonly repository: ITicketRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
