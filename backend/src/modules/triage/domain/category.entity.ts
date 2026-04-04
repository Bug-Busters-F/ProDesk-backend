export class Category {
  constructor(
    public category: string,
    public confidence: number,
    public source: 'rule' | 'nlp' | 'fallback',
  ) {}
}
