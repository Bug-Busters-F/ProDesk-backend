export class TicketClosedEvent {
    constructor(
        public readonly title: string,
        public readonly ticketId: string,
        public readonly clientId: string,
        public readonly supportAgentId: string,
    ) {}
}