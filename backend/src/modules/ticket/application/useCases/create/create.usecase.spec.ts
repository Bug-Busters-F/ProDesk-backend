/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';

import { EventEmitter2 }
  from '@nestjs/event-emitter';

import {
  Ticket,
  TicketStatus,
} from '../../../domain/entities/ticket.entity';

import { ITicketRepository }
  from '../../../domain/repository/ticket.repository.interface';

import {
  CreateTicketInput,
  CreateTicketUseCase,
} from './create.usecase';

import { Category }
  from '../../../../triage/domain/category.entity';

describe('CreateTicketUseCase', () => {

  let repository: jest.Mocked<ITicketRepository>;

  let triageService: any;

  let eventEmitter: jest.Mocked<EventEmitter2>;

  let useCase: CreateTicketUseCase;

  const clientId = randomUUID();

  const input: CreateTicketInput = {
    title: 'titulo do ticket',
    description: 'descricao do ticket',
  };

  beforeEach(() => {

    const triageResult =
      new Category('iot', 0.9, 'nlp');

    triageService = {
      classify: jest.fn()
        .mockResolvedValue(triageResult),
    };

    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    const ticket = Ticket.create({
      ...input,
      clientId,
      category: triageResult.category,
    });

    repository = {
      create: jest.fn()
        .mockResolvedValue(ticket),

      save: jest.fn(),

      readAll: jest.fn(),

      readById: jest.fn(),

      delete: jest.fn(),

      findByStatus: jest.fn(),

      findByStatusCategory: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new CreateTicketUseCase(
      repository,
      triageService,
      eventEmitter,
    );
  });

  it(
    'Should exec usecase successfully and return the ticket',
    async () => {

      const output =
        await useCase.execute(
          input,
          clientId,
        );

      expect(output).toBeDefined();

      expect(typeof output._id)
        .toBe('string');

      expect(output.status)
        .toBe(TicketStatus.OPEN);

      expect(output.createdAt)
        .toBeInstanceOf(Date);

      expect(triageService.classify)
        .toHaveBeenCalledWith(
          input.description,
        );

      expect(repository.create)
        .toHaveBeenCalledTimes(1);

      expect(eventEmitter.emit)
        .toHaveBeenCalledTimes(1);

      expect(output)
        .not.toHaveProperty('escalate');

      expect(output)
        .not.toHaveProperty('close');

      expect(output)
        .not.toHaveProperty('assignToAgent');

      expect(output)
        .not.toHaveProperty('create');

      expect(output)
        .not.toHaveProperty('restore');

      expect(output)
        .not.toHaveProperty('toPrimitives');
    },
  );
});