import { Module } from '@nestjs/common';
import { TriageService } from './application/triage.service';
import { NlpProvider } from './infra/nlp.provider';
import { TriageController } from './presentation/triage.controller';
import { CategoryModule } from '../category/category.module';
import { RulesEngine } from './infra/rules.engine';

@Module({
  imports: [CategoryModule],
  providers: [TriageService, NlpProvider,RulesEngine],
  exports: [TriageService],
  controllers: [TriageController],
})
export class TriageModule {}
