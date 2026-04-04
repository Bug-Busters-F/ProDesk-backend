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
    this.manager.addDocument('pt', 'site não abre', TicketCategory.WEB_APP);
    this.manager.addDocument('pt', 'erro na página', TicketCategory.WEB_APP);
    this.manager.addDocument(
      'pt',
      'aplicação web travando',
      TicketCategory.WEB_APP,
    );
    this.manager.addDocument('pt', 'problema no login', TicketCategory.WEB_APP);
    this.manager.addDocument(
      'pt',
      'não consigo acessar o sistema',
      TicketCategory.WEB_APP,
    );

    this.manager.addDocument(
      'pt',
      'ia não está respondendo',
      TicketCategory.IA,
    );
    this.manager.addDocument(
      'pt',
      'erro na classificação automática',
      TicketCategory.IA,
    );
    this.manager.addDocument(
      'pt',
      'modelo não está funcionando',
      TicketCategory.IA,
    );
    this.manager.addDocument('pt', 'problema com chatbot', TicketCategory.IA);

    this.manager.addDocument('pt', 'relatório não carrega', TicketCategory.BI);
    this.manager.addDocument('pt', 'erro no dashboard', TicketCategory.BI);
    this.manager.addDocument('pt', 'dados incorretos', TicketCategory.BI);
    this.manager.addDocument('pt', 'problema com métricas', TicketCategory.BI);

    this.manager.addDocument('pt', 'sensor não responde', TicketCategory.IOT);
    this.manager.addDocument(
      'pt',
      'dispositivo desconectado',
      TicketCategory.IOT,
    );
    this.manager.addDocument('pt', 'erro no equipamento', TicketCategory.IOT);
    this.manager.addDocument(
      'pt',
      'falha na comunicação com dispositivo',
      TicketCategory.IOT,
    );
  }

  async classify(text: string) {
    const normalized = this.normalize(text);

    const result = await this.manager.process('pt', normalized);

    const isValidCategory = Object.values(TicketCategory).includes(
      result.intent as TicketCategory,
    );

    return {
      category:
        result.intent === 'None' || !isValidCategory
          ? null
          : (result.intent as TicketCategory),
      confidence: result.score,
    };
  }

  private normalize(text: string): string {
    return text.toLowerCase().replace(/\n/g, ' ').slice(0, 500);
  }
}
