import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CompanyDocument } from './company.schema';
import { Model } from 'mongoose';
import { CompanyDTO } from './company.interface';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel("Company")
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  // Criar empresa
  async createCompany(name: string, cnpj: string): Promise<CompanyDTO> {
    const newCompany = new this.companyModel({
      name,
      cnpj,
    });

    const savedCompany = await newCompany.save();

    return this._getCompany(savedCompany);
  }

  // Buscar por ID
  async findById(id: string): Promise<CompanyDTO> {
    const company = await this.companyModel.findById(id);

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return this._getCompany(company);
  }

  // Listar todas
  async findAll(): Promise<CompanyDTO[]> {
    const companies = await this.companyModel.find();

    return companies.map(company => this._getCompany(company));
  }

  // Atualizar empresa
  async updateCompany(
    id: string,
    data: Partial<{
      name: string;
      cnpj: string;
    }>
  ): Promise<CompanyDTO> {
    const company = await this.companyModel.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!company) {
      throw new NotFoundException("Company not found");
    }

    return this._getCompany(company);
  }

  // Deletar empresa
  async deleteCompany(id: string): Promise<void> {
    const result = await this.companyModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException("Company not found");
    }
  }

  // Mapper (Document → DTO)
  private _getCompany(company: CompanyDocument): CompanyDTO {
    return {
      id: company._id.toString(),
      name: company.name,
      cnpj: company.cnpj,
    };
  }
}