import { Injectable } from "@nestjs/common";
import { CategoryService } from "../../category/category.service";

@Injectable()
export class RulesEngine {
  constructor(private readonly categoryService: CategoryService) { }

  async match(text: string) {
    const categories = await this.categoryService.findAll();

    const matches: { categoryId: string; category: string; confidence: number }[] = [];

    for (const category of categories) {
      for (const keyword of category.keywords || []) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          matches.push({
            categoryId: category.id,
            category: category.name,
            confidence: 0.95,
          });
          break;
        }
      }
    }

    if (matches.length === 0) return null;

    return matches[0];
  }
}
