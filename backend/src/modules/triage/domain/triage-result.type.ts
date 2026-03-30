import { TicketCategory } from "../../shared/domain/ticket-category.enum";

export type TriageResult = {
  category: TicketCategory;
  confidence: number;
  source: 'rule' | 'nlp' | 'fallback';
};