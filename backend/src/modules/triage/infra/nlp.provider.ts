import { Injectable, OnModuleInit } from '@nestjs/common';
import { NlpManager } from 'node-nlp';
import { TicketCategory } from '../../shared/domain/ticket-category.enum';

@Injectable()
export class NlpProvider implements OnModuleInit {
  private manager: NlpManager;

  async onModuleInit() {
    this.manager = new NlpManager({ languages: ['pt'] });

    this.addTrainingData();

    await this.manager.train();
  }

  private addTrainingData() {
    // FINANCEIRO
    this.manager.addDocument('pt', 'não consigo pagar', TicketCategory.WEB_APP);
    this.manager.addDocument('pt', 'erro no boleto', TicketCategory.WEB_APP);
    this.manager.addDocument('pt', 'problema com pagamento', TicketCategory.WEB_APP);

    // SUPORTE
    this.manager.addDocument('pt', 'app não funciona', TicketCategory.IA);
    this.manager.addDocument('pt', 'erro no sistema', TicketCategory.IA);
    this.manager.addDocument('pt', 'aplicação travando', TicketCategory.IA);

    // ACESSO
    this.manager.addDocument('pt', 'não consigo entrar', TicketCategory.BI);
    this.manager.addDocument('pt', 'esqueci minha senha', TicketCategory.BI);
    this.manager.addDocument('pt', 'problema no login', TicketCategory.BI);
  }

  async classify(text: string) {
    const normalized = this.normalize(text);

    const result = await this.manager.process('pt', normalized);

    return {
      category: result.intent as TicketCategory,
      confidence: result.score,
    };
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/\n/g, ' ')
      .slice(0, 500);
  }
}