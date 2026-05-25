export class TicketOpenEvent {
    constructor(
        public readonly ticketId: string,
        public readonly title: string,
        public readonly category: string,
        public readonly level: number,
    ){}
}