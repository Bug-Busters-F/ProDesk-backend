import { Controller, Post, Body } from '@nestjs/common';
import { TriageService } from '../application/triage.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TriageDTO } from '../dtos/triageDTO';

@ApiTags('Triage')
@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  @ApiBody({ type: TriageDTO })
  async classify(@Body() body: { description: string }) {
    return this.triageService.classify(body.description);
  }
}
