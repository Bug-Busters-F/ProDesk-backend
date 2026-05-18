/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CreateTicketUseCase } from '../../application/useCases/create/create.usecase';
import { DeleteTicketUseCase } from '../../application/useCases/delete/delete.usecase';
import { EscalateTicketUseCase } from '../../application/useCases/escalate/escalate.usecase';
import {
  GetHistoryTicketOutput,
  GetHistoryTicketUseCase,
} from '../../application/useCases/getHistory/getHistory.usecase';
import { NewAgentTicketUseCase } from '../../application/useCases/newAgent/newAgent.usecase';
import { ReadAllTicketUseCase } from '../../application/useCases/readAll/readAll.usecase';
import { ReadByIdTicketUseCase } from '../../application/useCases/readById/readById.usecase';
import { CloseTicketUseCase } from '../../application/useCases/close/close.usecase';
import { CreateTicketRequest } from '../dtos/create.dto';
import { EscalateTicketRequest } from '../dtos/escalateTicket.dto';
import { TicketMapper } from '../mappers/ticket.mapper';
import { CloseTicketRequest } from '../dtos/closeTicket.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guards/jwt.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/guards/roles.decorator';
import { UserRole } from '../../../shared/enums/user.enum';
import { GetHistoryFilteredUseCase } from '../../application/useCases/getHistoryFiltered/getHistoryFiltered.usecase';
import { GetHistoryFiltersRequest } from '../dtos/getHistory.dto';
import {
  TicketEvents,
  TicketStatus,
} from '../../domain/entities/ticket.entity';

@ApiTags('Ticket')
@Controller('tickets')
@ApiBearerAuth()
export class TicketController {
  constructor(
    private readonly createUseCase: CreateTicketUseCase,
    private readonly readAllUseCase: ReadAllTicketUseCase,
    private readonly readByIdUseCase: ReadByIdTicketUseCase,
    private readonly getHistoryUseCase: GetHistoryTicketUseCase,
    private readonly getHistoryFilteredUseCase: GetHistoryFilteredUseCase,
    private readonly escalateUseCase: EscalateTicketUseCase,
    private readonly newAgentUseCase: NewAgentTicketUseCase,
    private readonly deleteUseCase: DeleteTicketUseCase,
    private readonly closeUseCase: CloseTicketUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um ticket' })
  @ApiBody({ type: CreateTicketRequest })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso.' })
  async create(@Request() req: any, @Body() body: CreateTicketRequest) {
    const data = TicketMapper.toCreateInput(body);

    const response = await this.createUseCase.execute(data, req.user.id);

    return response;
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todos os tickets' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiResponse({
    status: 200,
    description: 'Todos os tickets retornados com sucesso.',
  })
  async getAll(@Request() req: any) {
    const response = await this.readAllUseCase.execute({
      userId: req.user.id,
      categories: req.user.categories ?? undefined,
      role: req.user.role,
    });

    return response;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna um ticket pelo ID' })
  @ApiParam({ name: 'id', example: 'uuid-do-ticket' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiResponse({ status: 200, description: 'Ticket encontrado com sucesso.' })
  async getById(@Param('id') id: string) {
    const response = await this.readByIdUseCase.execute(id);

    return response;
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Retorna o histórico de um ticket pelo ID' })
  @ApiParam({ name: 'id', example: 'uuid-do-ticket' })
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
  @ApiQuery({ name: 'event', enum: TicketEvents, required: false })
  @ApiQuery({ name: 'responsibleAgent', type: String, required: false })
  @ApiQuery({
    name: 'fromDate',
    type: String,
    required: false,
    example: '2024-01-01T00:00:00.000Z',
  })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.CLIENT)
  @ApiResponse({ status: 200, description: 'Histórico retornado com sucesso.' })
  async getHistoryById(
    @Param('id') id: string,
    @Query() filters: GetHistoryFiltersRequest,
  ) {
    let response: GetHistoryTicketOutput;

    const hasFilters =
      filters.status ||
      filters.responsibleAgent ||
      filters.event ||
      filters.fromDate;

    if (hasFilters) {
      response = await this.getHistoryFilteredUseCase.execute(id, {
        status: filters.status,
        responsibleAgent: filters.responsibleAgent,
        event: filters.event,
        fromDate: filters.fromDate ? new Date(filters.fromDate) : undefined,
      });
    } else {
      response = await this.getHistoryUseCase.execute(id);
    }

    return response;
  }

  @Put(':id/escalate')
  @ApiOperation({ summary: 'Escalona um ticket' })
  @ApiParam({ name: 'id', example: 'uuid-do-ticket' })
  @ApiBody({ type: EscalateTicketRequest })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiResponse({ status: 200, description: 'Ticket escalonado com sucesso.' })
  async escalateTicket(
    @Param('id') id: string,
    @Body() body: EscalateTicketRequest,
  ) {
    const data = TicketMapper.toEscalateTicketInput(id, body);

    const response = await this.escalateUseCase.execute(data);

    return response;
  }

  @Put(':id/assignAgent')
  @ApiOperation({ summary: 'Atribui um agente ao ticket' })
  @ApiParam({ name: 'id', example: 'uuid-do-ticket' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPPORT)
  @ApiResponse({ status: 200, description: 'Agente atribuído com sucesso.' })
  async assignAgent(@Request() req: any, @Param('id') id: string) {
    const data = TicketMapper.toNewAgentInput(id, req.user.id);

    const response = await this.newAgentUseCase.execute(data);

    return response;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um ticket' })
  @ApiParam({ name: 'id', example: 'uuid-do-ticket' })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 200, description: 'Ticket removido com sucesso.' })
  async delete(@Param('id') id: string) {
    const response = await this.deleteUseCase.execute(id);

    return { deleted: response };
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Fecha um ticket' })
  @ApiParam({ name: 'id', example: 'uuid-do-ticket' })
  @ApiBody({ type: CloseTicketRequest })
  @ApiResponse({ status: 200, description: 'Ticket fechado com sucesso.' })
  async closeTicket(@Param('id') id: string, @Body() body: CloseTicketRequest) {
    const data = TicketMapper.toCloseTicketInput(id, body);

    const response = await this.closeUseCase.execute(data);

    return response;
  }
}
