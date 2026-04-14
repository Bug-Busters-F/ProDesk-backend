import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument } from './category.schema';
import { CategoryDetails } from './category.interface';
import categoriesSeed from './seed/categories.seed.json';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category')
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<CategoryDetails[]> {
    const categories = await this.categoryModel.find().exec();
    return categories.map((category) => this._getCategory(category));
  }

  async findById(id: string): Promise<CategoryDetails> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this._getCategory(category);
  }

  async findByName(name: string): Promise<CategoryDetails> {
    const category = await this.categoryModel.findOne({ name }).exec();

    if (!category) {
      throw new NotFoundException(`Category not found: ${name}`);
    }

    return this._getCategory(category);
  }

  async createCategory(
    name: string,
    keywords?: string[],
    trainingPhrases?: string[],
  ): Promise<CategoryDetails> {
    const newCategory = new this.categoryModel({
      name,
      keywords,
      trainingPhrases,
    });

    const savedCategory = await newCategory.save();

    return this._getCategory(savedCategory);
  }

  async updateCategory(
    id: string,
    data: Partial<CategoryDetails>,
  ): Promise<CategoryDetails> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return this._getCategory(updatedCategory);
  }

  async deleteCategory(id: string): Promise<void> {
    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec();

    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }
  }

  async createInitialCategories() {
    const existingCategories = await this.categoryModel.find();

    for (const category of categoriesSeed) {
      const exists = existingCategories.find(
        c => c.name === category.name,
      );

      if (!exists) {
        await this.createCategory(
          category.name,
          category.keywords,
          category.trainingPhrases,
        );
      }
    }
  }

  private _getCategory(category: any): CategoryDetails {
    return {
      id: category._id,
      name: category.name,
      keywords: category.keywords,
      trainingPhrases: category.trainingPhrases,
    };
  }
}