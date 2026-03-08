import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { MemoryService } from '../memory/memory.service';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private memory: MemoryService) {}

  @Get('me/context')
  async getMyContext(@Req() req: Request) {
    const userId = req['user'].sub;
    return this.memory.getUserContext(userId);
  }
}
