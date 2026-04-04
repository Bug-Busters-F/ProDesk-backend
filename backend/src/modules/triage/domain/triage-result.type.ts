export type TriageResult = {
  category: string;
  confidence: number;
  source: 'rule' | 'nlp' | 'fallback';
};
