import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CompanyDocument } from './company.schema';
import { Model } from 'mongoose';
import { CompanyDetails } from './company.interface';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel('Company')
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  async createCompany(name: string, cnpj: string): Promise<CompanyDetails> {
    const cnpjExist = await this.companyModel.findOne({ cnpj });

    if (cnpjExist) {
      throw new BadRequestException('CNPJ already exists!');
    }

    const newCompany = new this.companyModel({ name, cnpj });
    const savedCompany = await newCompany.save();

    return this._getCompany(savedCompany);
  }

  async findById(id: string): Promise<CompanyDetails> {
    const company = await this.companyModel.findById(id).exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this._getCompany(company);
  }

  async findByCnpj(cnpj: string): Promise<CompanyDetails> {
    const company = await this.companyModel.findOne({ cnpj }).exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this._getCompany(company);
  }

  async findAll(): Promise<CompanyDetails[]> {
    const companies = await this.companyModel.find().exec();

    return companies.map((company) => this._getCompany(company));
  }

  async updateCompany(
    id: string,
    data: Partial<CompanyDetails>,
  ): Promise<CompanyDetails> {
    const cnpj = data.cnpj;
    const cnpjExist = await this.companyModel.findOne({ cnpj });

    if (cnpjExist) {
      throw new BadRequestException('CNPJ already exists!');
    }

    const updateCompany = await this.companyModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!updateCompany) {
      throw new NotFoundException('Company not found');
    }

    return this._getCompany(updateCompany);
  }

  async deleteCompany(id: string): Promise<void> {
    const result = await this.companyModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Company not found');
    }
  }

  private _getCompany(company: CompanyDocument): CompanyDetails {
    return {
      id: company._id.toString(),
      name: company.name,
      cnpj: company.cnpj,
    };
  }
}
