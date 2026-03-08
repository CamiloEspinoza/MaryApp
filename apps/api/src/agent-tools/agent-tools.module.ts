import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AgentToolsController } from './agent-tools.controller';
import { TripsModule } from '../trips/trips.module';
import { AmadeusModule } from '../amadeus/amadeus.module';
import { TripAdvisorModule } from '../tripadvisor/tripadvisor.module';
import { MemoryModule } from '../memory/memory.module';
import { WebSearchModule } from '../websearch/websearch.module';

@Module({
  imports: [
    TripsModule,
    AmadeusModule,
    TripAdvisorModule,
    MemoryModule,
    WebSearchModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [AgentToolsController],
})
export class AgentToolsModule {}
