export class Category {
  constructor(
    public categoryId: string,
    public category: string,
    public confidence: number,
    public source: 'rule' | 'nlp' | 'fallback',
  ) {}
}
