import { Test, TestingModule } from '@nestjs/testing';
import { TriageController } from './triage.controller';
import { TriageService } from '../application/triage.service';
import { TicketCategory } from '../../shared/domain/ticket-category.enum';

describe('TriageController', () => {
  let controller: TriageController;
  let triageService: jest.Mocked<TriageService>;

  const mockTriageService = {
    classify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriageController],
      providers: [
        {
          provide: TriageService,
          useValue: mockTriageService,
        },
      ],
    }).compile();

    controller = module.get<TriageController>(TriageController);
    triageService = module.get(TriageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve classificar corretamente uma descrição', async () => {
    const mockResponse = {
      value: TicketCategory.WEB_APP,
      confidence: 0.95,
      source: 'rule',
    };

    triageService.classify.mockResolvedValue(mockResponse as any);

    const body = {
      description: 'site não abre',
    };

    const result = await controller.classify(body);

    expect(triageService.classify).toHaveBeenCalledWith(body.description);
    expect(result).toEqual(mockResponse);
  });

  it('deve retornar fallback quando service retornar OTHER', async () => {
    const mockResponse = {
      value: TicketCategory.OTHER,
      confidence: 0.5,
      source: 'fallback',
    };

    triageService.classify.mockResolvedValue(mockResponse as any);

    const body = {
      description: 'qualquer coisa aleatória',
    };

    const result = await controller.classify(body);

    expect(result.value).toBe(TicketCategory.OTHER);
    expect(result.source).toBe('fallback');
  });

  it('deve chamar o service apenas uma vez', async () => {
    triageService.classify.mockResolvedValue({
      value: TicketCategory.BI,
      confidence: 0.9,
      source: 'rule',
    } as any);

    await controller.classify({ description: 'erro no dashboard' });

    expect(triageService.classify).toHaveBeenCalledTimes(1);
  });
});