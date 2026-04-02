import { TicketCategory } from "../../shared/domain/ticket-category.enum";

type Rule = {
  pattern: RegExp;
  category: TicketCategory;
  confidence: number;
};

const RULES: Rule[] = [
  {
    pattern: /(site|página|frontend|tela|login|acesso)/i,
    category: TicketCategory.WEB_APP,
    confidence: 0.95,
  },
  {
    pattern: /(ia|inteligência artificial|modelo|chatbot|classificação)/i,
    category: TicketCategory.IA,
    confidence: 0.95,
  },
  {
    pattern: /(relatório|dashboard|dados|métricas|indicadores)/i,
    category: TicketCategory.BI,
    confidence: 0.95,
  },
  {
    pattern: /(sensor|dispositivo|iot|equipamento|hardware)/i,
    category: TicketCategory.IOT,
    confidence: 0.95,
  },
];

export class RulesEngine {
  static match(text: string) {
    const matches = RULES
      .filter(rule => rule.pattern.test(text))
      .sort((a, b) => b.confidence - a.confidence);

    if (matches.length === 0) return null;

    const best = matches[0];

    return {
      category: best.category,
      confidence: best.confidence,
    };
  }
}