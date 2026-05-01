/* eslint-disable @typescript-eslint/unbound-method */
import { randomUUID } from 'crypto';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { DeleteTicketUseCase } from './delete.usecase';

describe('DeleteTicketUseCase', () => {
  let repository: jest.Mocked<ITicketRepository>;
  let useCase: DeleteTicketUseCase;

  beforeEach(() => {
    repository = {
      delete: jest.fn().mockResolvedValue(true),
      create: jest.fn(),
      save: jest.fn(),
      readAll: jest.fn(),
      readById: jest.fn(),
      findByStatus: jest.fn(),
      findByStatusCategory: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new DeleteTicketUseCase(repository);
  });

  it('Should exec usecase successfully and return the delete status (true)', async () => {
    const idToDelete = randomUUID();

    const output = await useCase.execute(idToDelete);

    expect(output).toBeDefined();
    expect(typeof output).toBe('boolean');
    expect(output).toBe(true);

    expect(repository.delete).toHaveBeenCalledTimes(1);
    expect(repository.delete).toHaveBeenCalledWith(idToDelete);
  });
});
