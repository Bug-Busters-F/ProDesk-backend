import { Module } from '@nestjs/common';
import { TriageService } from './application/triage.service';
import { NlpProvider } from './infra/nlp.provider';
import { TriageController } from './presentation/triage.controller';

@Module({
  providers: [TriageService, NlpProvider],
  exports: [TriageService],
  controllers: [TriageController],
})
export class TriageModule {}
