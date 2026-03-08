import { Controller, Get, Delete, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TripsService } from './trips.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('trips')
@UseGuards(JwtGuard)
export class TripsController {
  constructor(private trips: TripsService) {}

  @Get()
  list(@Req() req: Request) {
    return this.trips.listByUser(req['user'].sub);
  }

  @Get(':id')
  get(@Param('id') id: string, @Req() req: Request) {
    return this.trips.getById(id, req['user'].sub);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    return this.trips.delete(id, req['user'].sub);
  }
}
