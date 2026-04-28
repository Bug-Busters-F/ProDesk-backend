import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateFaqUseCase } from "../../application/create/create.usecase";
import { UpdateFaqUseCase } from "../../application/update/update.usecase";
import { DeleteFaqUseCase } from "../../application/delete/delete.usecase";
import { ReadAllFaqUseCase } from "../../application/readAll/readAll.usecase";
import { ReadByIdFaqUseCase } from "../../application/readById/readById.usecase";
import { JwtGuard } from "../../../auth/guards/jwt.guard";
import { RolesGuard } from "../../../auth/guards/roles.guard";
import { UserRole } from "../../../user/user.schema";
import { CreateFaqRequest } from "../dtos/create.dto";
import { FaqMapper } from "../mappers/faq.mapper";
import { Roles } from "../../../auth/guards/roles.decorator";
import { UpdateFaqRequest } from "../dtos/update.dto";

@ApiTags('FAQ')
@ApiBearerAuth()
@Controller('faqs')
export class FaqController {
    constructor (
        private readonly createUseCase: CreateFaqUseCase,
        private readonly updateUseCase: UpdateFaqUseCase,
        private readonly deleteUseCase: DeleteFaqUseCase,
        private readonly readAllUseCase: ReadAllFaqUseCase,
        private readonly readByIdUseCase: ReadByIdFaqUseCase
    ) {}

    @Post()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Criar FAQ' })
    @ApiBody({ type: CreateFaqRequest })
    @ApiResponse({ status: 201, description: 'FAQ criado com sucesso' })
    @ApiResponse({ status: 403, description: 'Acesso negado (somente ADMIN)' })
    async create(@Body() body: CreateFaqRequest) {
        const data = FaqMapper.toCreateInput(body);
        return this.createUseCase.execute(data);
    }

    @Get()
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Listar todos os FAQs' })
    @ApiResponse({ status: 200, description: 'FAQs retornados com sucesso' })
    async ReadAll() {
        return this.readAllUseCase.execute();
    }

    @Get(':id')
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Buscar FAQ por ID' })
    @ApiParam({ name: 'id', example: 'uuid-do-faq' })
    @ApiResponse({ status: 200, description: 'FAQ encontrado com sucesso' })
    @ApiResponse({ status: 404, description: 'FAQ não encontrado' })
    async readById(@Param('id') id: string) {
        return this.readByIdUseCase.execute(id);
    }

    @Put(':id')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Atualizar FAQ' })
    @ApiParam({ name: 'id', example: 'uuid-do-faq' })
    @ApiBody({ type: UpdateFaqRequest })
    @ApiResponse({ status: 200, description: 'FAQ atualizado com sucesso' })
    @ApiResponse({ status: 404, description: 'FAQ não encontrado' })
    @ApiResponse({ status: 403, description: 'Acesso negado (somente ADMIN)' })
    async update(@Param('id') id: string, @Body() body: UpdateFaqRequest) {
        const data = FaqMapper.toUpdateInput(id, body);
        return this.updateUseCase.execute(data);
    }

    // Falta o delete
}