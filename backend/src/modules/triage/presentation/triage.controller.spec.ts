import { Test, TestingModule } from '@nestjs/testing';
import { TriageController } from './triage.controller';
import { TriageService } from '../application/triage.service';
import { Category } from '../domain/category.entity';

describe('TriageController', () => {
  let controller: TriageController;
  let triageService: jest.Mocked<TriageService>;

  const mockTriageService = {
    classify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [TriageController],
        providers: [
          {
            provide: TriageService,
            useValue: mockTriageService,
          },
        ],
      }).compile();

    controller =
      module.get<TriageController>(
        TriageController
      );

    triageService =
      module.get(TriageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(
    'deve classificar corretamente uma descrição',
    async () => {

      const mockResponse =
        new Category(
          'WEB_APP',
          0.95,
          'rule'
        );

      triageService.classify
        .mockResolvedValue(
          mockResponse
        );

      const body = {
        description: 'site não abre',
      };

      const result =
        await controller.classify(
          body
        );

      expect(
        triageService.classify
      ).toHaveBeenCalledWith(
        body.description
      );

      expect(result)
        .toEqual(mockResponse);
    }
  );

  it(
    'deve retornar fallback quando categoria for OTHER',
    async () => {

      const mockResponse =
        new Category(
          'OTHER',
          0.5,
          'fallback'
        );

      triageService.classify
        .mockResolvedValue(
          mockResponse
        );

      const body = {
        description:
          'qualquer coisa aleatória',
      };

      const result =
        await controller.classify(
          body
        );

      expect(result.category)
        .toBe('OTHER');

      expect(result.source)
        .toBe('fallback');
    }
  );

  it(
    'deve chamar o service apenas uma vez',
    async () => {

      triageService.classify
        .mockResolvedValue(
          new Category(
            'BI',
            0.9,
            'rule'
          )
        );

      await controller.classify({
        description:
          'erro no dashboard',
      });

      expect(
        triageService.classify
      ).toHaveBeenCalledTimes(1);
    }
  );
});