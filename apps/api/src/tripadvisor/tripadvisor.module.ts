import { Module } from '@nestjs/common';
import { TripAdvisorService } from './tripadvisor.service';

@Module({
  providers: [TripAdvisorService],
  exports: [TripAdvisorService],
})
export class TripAdvisorModule {}
