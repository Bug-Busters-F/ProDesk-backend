import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TicketSchema,
  TicketSchemaClass,
} from './infra/schemas/ticket.mongo.schema';
import { TicketController } from './presentation/controllers/ticket.controller';
import { ITicketRepository } from './domain/repository/ticket.repository.interface';
import { TicketMongoRepository } from './infra/repositories/ticket.mongodb.repository';
import { CreateTicketUseCase } from './application/useCases/create/create.usecase';
import { ReadAllTicketUseCase } from './application/useCases/readAll/readAll.usecase';
import { ReadByIdTicketUseCase } from './application/useCases/readById/readById.usecase';
import { GetHistoryTicketUseCase } from './application/useCases/getHistory/getHistory.usecase';
import { EscalateTicketUseCase } from './application/useCases/escalate/escalate.usecase';
import { DeleteTicketUseCase } from './application/useCases/delete/delete.usecase';
import { NewAgentTicketUseCase } from './application/useCases/newAgent/newAgent.usecase';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TicketSchemaClass.name, schema: TicketSchema },
    ]),
  ],
  controllers: [TicketController],
  providers: [
    { provide: ITicketRepository, useClass: TicketMongoRepository },
    CreateTicketUseCase,
    ReadAllTicketUseCase,
    ReadByIdTicketUseCase,
    GetHistoryTicketUseCase,
    EscalateTicketUseCase,
    DeleteTicketUseCase,
    NewAgentTicketUseCase,
  ],
})
export class TicketModule {}
