import { Module } from '@nestjs/common';
import { TriageService } from './application/triage.service';
import { NlpProvider } from './infra/nlp.provider';

@Module({
  providers: [TriageService, NlpProvider],
  exports: [TriageService],
})
export class TriageModule {}