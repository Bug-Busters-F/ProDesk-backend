import { CloseTicketUseCase } from './close.usecase';
import { ITicketRepository } from '../../../domain/repository/ticket.repository.interface';
import { Ticket } from '../../../domain/entities/ticket.entity';

describe('CloseTicketUseCase', () => {
  let useCase: CloseTicketUseCase;
  let repository: jest.Mocked<ITicketRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      readById: jest.fn(),
      readAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ITicketRepository>;

    useCase = new CloseTicketUseCase(repository);
  });

  it('should close a ticket successfully', async () => {
    // Arrange
    const ticket = Ticket.create({
      title: 'Erro no sistema',
      category: 'TI',
      description: 'Sistema não responde',
      clientId: 'client-id',
    });

    // precisa estar IN_PROGRESS para fechar
    ticket.assignToAgent('agent-id');

    repository.readById.mockResolvedValue(ticket);
    repository.save.mockResolvedValue(ticket);

    // Act
    const result = await useCase.execute({
      id: ticket.id,
      solution: 'Servidor reiniciado',
    });

    // Assert
    expect(repository.readById).toHaveBeenCalledWith(ticket.id);
    expect(repository.save).toHaveBeenCalled();

    expect(result.status).toBe('CLOSED');
  });

  it('should throw error if ticket not found', async () => {
    repository.readById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'invalid-id',
        solution: 'Teste',
      }),
    ).rejects.toThrow('Ticket not found');
  });

  it('should throw error if ticket is not IN_PROGRESS', async () => {
    const ticket = Ticket.create({
      title: 'Erro no sistema',
      category: 'TI',
      description: 'Sistema não responde',
      clientId: 'client-id',
    });

    repository.readById.mockResolvedValue(ticket);

    await expect(
      useCase.execute({
        id: ticket.id,
        solution: 'Teste',
      }),
    ).rejects.toThrow();
  });

  it('should throw error if solution is empty', async () => {
    const ticket = Ticket.create({
      title: 'Erro no sistema',
      category: 'TI',
      description: 'Sistema não responde',
      clientId: 'client-id',
    });

    ticket.assignToAgent('agent-id');

    repository.readById.mockResolvedValue(ticket);

    await expect(
      useCase.execute({
        id: ticket.id,
        solution: '',
      }),
    ).rejects.toThrow();
  });
});