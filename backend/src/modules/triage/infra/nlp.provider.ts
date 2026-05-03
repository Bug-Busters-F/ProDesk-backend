import { Injectable, OnModuleInit } from '@nestjs/common';
import { NlpManager } from 'node-nlp';
import { CategoryService } from '../../category/category.service';
import { normalizeIntent } from '../../shared/utils/intent-normalizer';

@Injectable()
export class NlpProvider implements OnModuleInit {
  constructor(private readonly categoryService: CategoryService) { }
  private manager: NlpManager;

  async onModuleInit() {
    this.manager = new NlpManager({ languages: ['pt'] });

    await this.addTrainingData();
    await this.manager.train();
  }

  private async addTrainingData() {
    const categories = await this.categoryService.findAll();

    for (const category of categories) {
      const intent = normalizeIntent(category.name);

      for (const phrase of category.trainingPhrases || []) {
        this.manager.addDocument('pt', phrase, intent);
      }
    }
  }

  async classify(text: string) {
    const normalized = this.normalize(text);
    const result = await this.manager.process('pt', normalized);

    if (result.intent === 'None') {
      return {
        categoryId: null,
        category: null,
        confidence: result.score,
      };
    }

    const categories = await this.categoryService.findAll();

    const found = categories.find(
      (cat) => normalizeIntent(cat.name) === result.intent,
    );

    return {
      categoryId: found?.id || null,
      category: found?.name || null,
      confidence: result.score,
    };
  }

  private normalize(text: string): string {
    return text.toLowerCase().replace(/\n/g, ' ').slice(0, 500);
  }
}
