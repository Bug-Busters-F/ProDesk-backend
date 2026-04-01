import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateTicketUseCase } from '../../application/useCases/create/create.usecase';
import { DeleteTicketUseCase } from '../../application/useCases/delete/delete.usecase';
import { EscalateTicketUseCase } from '../../application/useCases/escalate/escalate.usecase';
import { GetHistoryTicketUseCase } from '../../application/useCases/getHistory/getHistory.usecase';
import { NewAgentTicketUseCase } from '../../application/useCases/newAgent/newAgent.usecase';
import { ReadAllTicketUseCase } from '../../application/useCases/readAll/readAll.usecase';
import { ReadByIdTicketUseCase } from '../../application/useCases/readById/readById.usecase';
import { CreateTicketRequest } from '../dtos/create.dto';
import { EscalateTicketRequest } from '../dtos/escalateTicket.dto';
import { TicketMapper } from '../mappers/ticket.mapper';
import { AssignAgentRequest } from '../dtos/assignAgent.dto';

@Controller('tickets')
export class TicketController {
  constructor(
    private readonly createUseCase: CreateTicketUseCase,
    private readonly readAllUseCase: ReadAllTicketUseCase,
    private readonly readByIdUseCase: ReadByIdTicketUseCase,
    private readonly getHistoryUseCase: GetHistoryTicketUseCase,
    private readonly escalateUseCase: EscalateTicketUseCase,
    private readonly newAgentUseCase: NewAgentTicketUseCase,
    private readonly deleteUseCase: DeleteTicketUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateTicketRequest) {
    const data = TicketMapper.toCreateInput(body);

    const response = await this.createUseCase.execute(data);

    return response;
  }

  @Get()
  async getAll() {
    const response = await this.readAllUseCase.execute();

    return response;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const response = await this.readByIdUseCase.execute(id);

    return response;
  }

  @Get(':id/history')
  async getHistoryById(@Param('id') id: string) {
    const response = await this.getHistoryUseCase.execute(id);

    return response;
  }

  @Put(':id/escalate')
  async escalateTicket(
    @Param('id') id: string,
    @Body() body: EscalateTicketRequest,
  ) {
    const data = TicketMapper.toEscalateTicketInput(id, body);

    const response = await this.escalateUseCase.execute(data);

    return response;
  }

  @Put(':id/assignAgent')
  async assignAgent(@Param('id') id: string, @Body() body: AssignAgentRequest) {
    const data = TicketMapper.toNewAgentInput(id, body);

    const response = await this.newAgentUseCase.execute(data);

    return response;
  }

  @Delete(':id')
  async delete(@Param() id: string) {
    const response = await this.deleteUseCase.execute(id);

    return { deleted: response };
  }
}
