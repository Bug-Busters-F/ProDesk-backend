import { TicketCategory } from '../../shared/domain/ticket-category.enum';

export class Category {
  constructor(
    public value: string,
    public confidence: number,
    public source: 'rule' | 'nlp' | 'fallback',
  ) {}
}
