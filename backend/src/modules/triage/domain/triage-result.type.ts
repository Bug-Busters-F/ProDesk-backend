import { TicketCategory } from '../../shared/domain/ticket-category.enum';

export type TriageResult = {
  category: string;
  confidence: number;
  source: 'rule' | 'nlp' | 'fallback';
};
