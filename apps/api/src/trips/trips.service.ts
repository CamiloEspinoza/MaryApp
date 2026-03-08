import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async listByUser(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      include: { participants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: {
        participants: true,
        itineraryDays: {
          include: { items: { orderBy: { startTime: 'asc' } } },
          orderBy: { date: 'asc' },
        },
        transportations: { orderBy: { departureTime: 'asc' } },
        accommodations: { orderBy: { checkIn: 'asc' } },
      },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');
    return trip;
  }

  async create(data: {
    userId: string;
    title: string;
    destination: string;
    startDate: string;
    endDate?: string;
    objectives?: string;
    participants?: string[];
  }) {
    return this.prisma.trip.create({
      data: {
        title: data.title,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        objectives: data.objectives,
        userId: data.userId,
        participants: data.participants?.length
          ? { create: data.participants.map((name) => ({ name })) }
          : undefined,
      },
      include: { participants: true },
    });
  }

  async delete(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    await this.prisma.trip.delete({ where: { id: tripId } });
    return { message: 'Viaje eliminado' };
  }

  async addTransportation(tripId: string, userId: string, data: {
    type: string;
    origin: string;
    destination: string;
    carrier?: string;
    flightNumber?: string;
    departureTime: string;
    arrivalTime: string;
    cost?: number;
    currency?: string;
    bookingRef?: string;
  }) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    return this.prisma.transportation.create({
      data: {
        type: data.type as any,
        origin: data.origin,
        destination: data.destination,
        carrier: data.carrier,
        flightNumber: data.flightNumber,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        cost: data.cost,
        currency: data.currency ?? 'USD',
        bookingRef: data.bookingRef,
        tripId,
      },
    });
  }

  async addAccommodation(tripId: string, userId: string, data: {
    name: string;
    address?: string;
    checkIn: string;
    checkOut: string;
    cost?: number;
    currency?: string;
    bookingRef?: string;
    amadeusHotelId?: string;
  }) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    return this.prisma.accommodation.create({
      data: {
        name: data.name,
        address: data.address,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        cost: data.cost,
        currency: data.currency ?? 'USD',
        bookingRef: data.bookingRef,
        amadeusHotelId: data.amadeusHotelId,
        tripId,
      },
    });
  }

  async addItineraryItem(tripId: string, userId: string, data: {
    date: string;
    type?: string;
    title: string;
    description?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    cost?: number;
    currency?: string;
  }) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    const day = await this.prisma.itineraryDay.upsert({
      where: { tripId_date: { tripId, date: new Date(data.date) } },
      update: {},
      create: { tripId, date: new Date(data.date) },
    });

    return this.prisma.itineraryItem.create({
      data: {
        type: (data.type as any) ?? 'ACTIVITY',
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        cost: data.cost,
        currency: data.currency ?? 'USD',
        dayId: day.id,
      },
    });
  }
}
