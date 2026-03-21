export interface IMessageRepository {
    create(messageData: any): Promise<any>;
    findByTicketId(ticketId: string): Promise<any[]>;
}

// Any temporário para simplificar, ideal é ter uma entidade de domínio para a mensagem.