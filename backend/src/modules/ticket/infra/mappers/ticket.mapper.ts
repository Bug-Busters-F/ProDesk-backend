import {
  Ticket,
  TicketEventMessage,
  TicketEvents,
  TicketPriority,
  TicketStatus,
  TicketHistoryEntry,
} from '../../domain/entities/ticket.entity';
import { TicketDocument, TicketLean } from '../schemas/ticket.mongo.schema';

export class TicketMapper {
  static toDomain(doc: TicketDocument | TicketLean): Ticket {
    return Ticket.restore({
      _id: doc._id.toString(),
      title: doc.title,
      category: doc.category,
      priority: doc.priority as TicketPriority,
      status: doc.status as TicketStatus,
      description: doc.description,
      clientId: doc.clientId,
      agent: doc.agent?.id
        ? { id: doc.agent.id.toString(), name: doc.agent.name }
        : null,
      escalationLevel: doc.escalationLevel,
      fileUrls: doc.attachmentsUrls,
      history: doc.history.map(
        (h): TicketHistoryEntry => ({
          event: h.event as TicketEvents,
          responsibleAgent: h.responsibleAgent,
          status: h.status as TicketStatus,
          message: h.message as TicketEventMessage,
          solution: h.solution,
          occurredAt: h.occurredAt,
        }),
      ),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      closedAt: doc.closedAt ?? undefined,
    });
  }

  static toPersistence(ticket: Ticket): Record<string, any> {
    return ticket.toPrimitives();
  }
}
