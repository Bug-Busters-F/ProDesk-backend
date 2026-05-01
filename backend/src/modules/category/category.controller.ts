import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDetails } from './category.interface';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCategoryDTO } from './dtos/createCategoryDTO';
import { UpdateCategoryDTO } from './dtos/updateCategoryDTO';
import { UserRole } from '../shared/enums/user.enum';

@ApiTags('Category')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {
    this.categoryService.createInitialCategories();
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiBody({ type: CreateCategoryDTO })
  createCategory(
    @Body() category: CreateCategoryDTO,
  ): Promise<CategoryDetails> {
    return this.categoryService.createCategory(
      category.name,
      category.keywords,
      category.trainingPhrases,
    );
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada' })
  getAllCategories(): Promise<CategoryDetails[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  getCategory(@Param('id') id: string): Promise<CategoryDetails> {
    return this.categoryService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiBody({ type: UpdateCategoryDTO })
  updateCategory(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDTO,
  ): Promise<CategoryDetails> {
    return this.categoryService.updateCategory(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deletar categoria' })
  @ApiParam({ name: 'id', example: '65f1a2b3c9d123456789abcd' })
  @ApiResponse({ status: 200, description: 'Categoria deletada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}
