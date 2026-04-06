import { Injectable } from '@nestjs/common';
import { NlpProvider } from '../infra/nlp.provider';
import { RulesEngine } from '../infra/rules.engine';
import { Category } from '../domain/category.entity';
import { CategoryService } from '../../category/category.service';
import { normalizeIntent } from '../../shared/utils/intent-normalizer';

@Injectable()
export class TriageService {
  private CONFIDENCE_THRESHOLD = 0.7;

  constructor(
    private readonly nlp: NlpProvider,
    private readonly rulesEngine: RulesEngine,
    private readonly categoryService: CategoryService,
  ) { }

  async classify(description: string): Promise<Category> {
    const ruleMatch = await this.rulesEngine.match(description);

    if (ruleMatch) {
      return new Category(ruleMatch.category, ruleMatch.confidence, 'rule');
    }

    const nlpResult = await this.nlp.classify(description);

    if (
      nlpResult.category &&
      nlpResult.confidence >= this.CONFIDENCE_THRESHOLD
    ) {
      return new Category(nlpResult.category, nlpResult.confidence, 'nlp');
    }

    const fallbackCategory = await this.categoryService.findByName('OTHER');

    return new Category(
      normalizeIntent(fallbackCategory.name),
      0.5,
      'fallback',
    );
  }
}
