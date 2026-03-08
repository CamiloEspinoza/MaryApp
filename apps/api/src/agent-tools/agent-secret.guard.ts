import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class AgentSecretGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = request.headers['x-agent-secret'] as string | undefined;
    const expected = this.config.getOrThrow<string>('AGENT_TOOLS_SECRET');

    if (!secret || secret !== expected) {
      throw new UnauthorizedException('Invalid agent secret');
    }

    return true;
  }
}
