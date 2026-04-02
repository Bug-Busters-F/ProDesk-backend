import { Injectable } from '@nestjs/common';
import { NlpProvider } from '../infra/nlp.provider';
import { RulesEngine } from '../infra/rules.engine';
import { Category } from '../domain/category.entity';
import { TicketCategory } from '../../shared/domain/ticket-category.enum';

@Injectable()
export class TriageService {
  private CONFIDENCE_THRESHOLD = 0.7;

  constructor(private readonly nlp: NlpProvider) {}

  async classify(description: string): Promise<Category> {
    const ruleMatch = RulesEngine.match(description);
    if (ruleMatch) {
      return new Category(
        ruleMatch.category,
        ruleMatch.confidence,
        'rule',
      );
    }

    const nlpResult = await this.nlp.classify(description);

    if (
      nlpResult.category &&
      nlpResult.confidence >= this.CONFIDENCE_THRESHOLD
    ) {
      return new Category(
        nlpResult.category,
        nlpResult.confidence,
        'nlp',
      );
    }

    return new Category(TicketCategory.OTHER, 0.5, 'fallback');
  }
}