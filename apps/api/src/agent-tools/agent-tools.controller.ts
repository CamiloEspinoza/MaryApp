import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtGuard } from '../auth/jwt.guard';
import { TripsService } from '../trips/trips.service';
import { AmadeusService } from '../amadeus/amadeus.service';
import { TripAdvisorService } from '../tripadvisor/tripadvisor.service';
import { MemoryService } from '../memory/memory.service';
import { WebSearchService } from '../websearch/websearch.service';

@Controller('agent-tools')
@UseGuards(JwtGuard)
export class AgentToolsController {
  private readonly logger = new Logger(AgentToolsController.name);

  constructor(
    private trips: TripsService,
    private amadeus: AmadeusService,
    private tripAdvisor: TripAdvisorService,
    private memory: MemoryService,
    private webSearch: WebSearchService,
  ) {}

  private params(body: any): any {
    return body.parameters ?? body;
  }

  // Accept both camelCase (from ElevenLabs client tools) and snake_case (legacy)
  private p(params: any, camel: string, snake?: string): any {
    return params[camel] ?? (snake ? params[snake] : undefined);
  }

  private getUserId(req: Request): string {
    return (req as any)['user']?.sub ?? '';
  }

  @Post('create_trip')
  async createTrip(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`create_trip: ${JSON.stringify(p)}`);
    const trip = await this.trips.create({
      userId: this.getUserId(req),
      title: p.title,
      destination: p.destination,
      startDate: this.p(p, 'startDate', 'start_date'),
      endDate: this.p(p, 'endDate', 'end_date'),
      objectives: p.objectives,
      participants: p.participants,
    });
    return {
      result: JSON.stringify({
        success: true,
        trip_id: trip.id,
        title: trip.title,
        destination: trip.destination,
        message: `Viaje creado. GUARDA ESTE ID para usarlo en add_transportation, add_accommodation y add_itinerary_item: trip_id="${trip.id}"`,
      }),
    };
  }

  @Post('delete_trip')
  async deleteTrip(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`delete_trip: ${JSON.stringify(p)}`);
    const userId = this.getUserId(req);
    const rawId = this.p(p, 'tripId', 'trip_id');
    const tripId = await this.trips.resolveTripId(userId, rawId);
    if (!tripId) {
      return { result: `No encontré ningún viaje con ese nombre o ID. Llama a get_my_trips para ver los viajes disponibles.` };
    }
    await this.trips.delete(tripId, userId);
    return { result: `Viaje eliminado correctamente.` };
  }

  @Post('get_my_trips')
  async getMyTrips(@Req() req: Request) {
    const trips = await this.trips.listByUser(this.getUserId(req));
    if (trips.length === 0) {
      return { result: 'No tienes viajes creados todavía.' };
    }
    return {
      result: {
        message: `Tienes ${trips.length} viaje(s)`,
        trips: trips.map((t) => ({
          id: t.id,
          title: t.title,
          destination: t.destination,
          startDate: t.startDate,
          endDate: t.endDate,
          status: t.status,
        })),
      },
    };
  }

  @Post('search_flights')
  async searchFlights(@Body() body: any) {
    const p = this.params(body);
    this.logger.log(`search_flights: ${JSON.stringify(p)}`);
    try {
      const results = await this.amadeus.searchFlights(
        p.origin,
        p.destination,
        this.p(p, 'departureDate', 'departure_date'),
        p.adults ?? 1,
        this.p(p, 'returnDate', 'return_date'),
      );
      if (results.length === 0) {
        return { result: 'No se encontraron vuelos para esas fechas y ruta.' };
      }
      const items = results.slice(0, 4).map((f: any) => {
        const seg = f.itineraries?.[0]?.segments?.[0] ?? {};
        const lastSeg = f.itineraries?.[0]?.segments?.at(-1) ?? {};
        const duration = (f.itineraries?.[0]?.duration ?? '').replace('PT', '').toLowerCase();
        return {
          id: f.id,
          title: `${seg.departure?.iataCode ?? p.origin} → ${lastSeg.arrival?.iataCode ?? p.destination}`,
          subtitle: `${seg.carrierCode ?? ''} ${seg.number ?? ''} · ${duration}`,
          detail: `Salida: ${seg.departure?.at ? new Date(seg.departure.at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '-'}`,
          price: f.price?.grandTotal ? `${f.price.grandTotal} ${f.price.currency}` : undefined,
          meta: `${f.numberOfBookableSeats ?? ''} asientos`,
        };
      });
      const summary = `Encontré ${results.length} vuelo(s): ${items.map((i) => `${i.title} por ${i.price ?? 'precio no disponible'}`).join(', ')}`;
      return { result: JSON.stringify({ summary, items }) };
    } catch (e) {
      return { result: `Error buscando vuelos: ${e.message}` };
    }
  }

  @Post('search_hotels')
  async searchHotels(@Body() body: any) {
    const p = this.params(body);
    this.logger.log(`search_hotels: ${JSON.stringify(p)}`);
    try {
      const cityCode = this.p(p, 'cityCode', 'city_code');
      const hotels = await this.amadeus.searchHotelsByCity(cityCode);
      if (hotels.length === 0) {
        return { result: 'No se encontraron hoteles en esa ciudad.' };
      }

      let source: any[] = hotels;
      const checkIn = this.p(p, 'checkIn', 'check_in') ?? this.p(p, 'checkInDate', 'check_in_date');
      const checkOut = this.p(p, 'checkOut', 'check_out') ?? this.p(p, 'checkOutDate', 'check_out_date');
      if (checkIn && checkOut) {
        const hotelIds = hotels.map((h: any) => h.hotelId);
        source = await this.amadeus.searchHotelOffers(
          hotelIds, checkIn, checkOut, p.adults ?? 1,
        );
      }

      const items = source.slice(0, 5).map((h: any) => {
        const hotelInfo = h.hotel ?? h;
        const offer = h.offers?.[0];
        return {
          id: hotelInfo.hotelId ?? String(Math.random()),
          title: hotelInfo.name ?? 'Hotel sin nombre',
          subtitle: hotelInfo.address?.cityName ?? hotelInfo.cityCode ?? p.city_code,
          detail: offer?.room?.description?.text?.slice(0, 60) ?? '',
          price: offer?.price?.total ? `${offer.price.total} ${offer.price.currency}` : undefined,
          meta: hotelInfo.rating ? `${hotelInfo.rating} estrellas` : undefined,
        };
      });
      const summary = `Encontré ${source.length} hotel(es): ${items.map((i) => `${i.title}${i.price ? ` desde ${i.price}` : ''}`).join(', ')}`;
      return { result: JSON.stringify({ summary, items }) };
    } catch (e) {
      return { result: `Error buscando hoteles: ${e.message}` };
    }
  }

  @Post('search_places')
  async searchPlaces(@Body() body: any) {
    const p = this.params(body);
    this.logger.log(`search_places: ${JSON.stringify(p)}`);
    try {
      const places = await this.tripAdvisor.searchPlaces(p.query, p.lat_long);
      if (places.length === 0) {
        return { result: 'No encontré lugares para esa búsqueda.' };
      }
      const items = places.slice(0, 5).map((pl: any) => ({
        id: pl.locationId ?? String(Math.random()),
        title: pl.name,
        subtitle: pl.address ?? '',
        detail: pl.category ?? '',
        meta: pl.rating ? `⭐ ${pl.rating}` : undefined,
        price: undefined,
        imageUrl: pl.photoUrl ?? undefined,
      }));
      const summary = `Encontré ${places.length} lugar(es): ${items.map((i) => i.title).join(', ')}`;
      return { result: JSON.stringify({ summary, items }) };
    } catch (e) {
      return { result: `Error buscando lugares: ${e.message}` };
    }
  }

  @Post('add_transportation')
  async addTransportation(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`add_transportation: ${JSON.stringify(p)}`);
    const userId = this.getUserId(req);
    const rawId = this.p(p, 'tripId', 'trip_id');
    const tripId = await this.trips.resolveTripId(userId, rawId);
    if (!tripId) {
      return { result: `No encontré el viaje "${rawId}". Llama a get_my_trips para obtener el trip_id correcto.` };
    }
    const transport = await this.trips.addTransportation(
      tripId,
      userId,
      {
        type: p.type ?? 'FLIGHT',
        origin: p.origin,
        destination: p.destination,
        carrier: p.carrier,
        flightNumber: this.p(p, 'flightNumber', 'flight_number'),
        departureTime: this.p(p, 'departureTime', 'departure_time'),
        arrivalTime: this.p(p, 'arrivalTime', 'arrival_time'),
        cost: this.p(p, 'cost', 'price'),
        currency: p.currency,
        bookingRef: this.p(p, 'bookingRef', 'booking_ref'),
      },
    );
    return { result: `Transporte agregado al viaje. ID: ${transport.id}` };
  }

  @Post('add_accommodation')
  async addAccommodation(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`add_accommodation: ${JSON.stringify(p)}`);
    const userId = this.getUserId(req);
    const rawId = this.p(p, 'tripId', 'trip_id');
    const tripId = await this.trips.resolveTripId(userId, rawId);
    if (!tripId) {
      return { result: `No encontré el viaje "${rawId}". Llama a get_my_trips para obtener el trip_id correcto.` };
    }
    const accommodation = await this.trips.addAccommodation(
      tripId,
      userId,
      {
        name: p.name,
        address: p.address,
        checkIn: this.p(p, 'checkIn', 'check_in') ?? this.p(p, 'checkInDate', 'check_in_date'),
        checkOut: this.p(p, 'checkOut', 'check_out') ?? this.p(p, 'checkOutDate', 'check_out_date'),
        cost: this.p(p, 'cost', 'price'),
        currency: p.currency,
        bookingRef: this.p(p, 'bookingRef', 'booking_ref'),
        amadeusHotelId: this.p(p, 'amadeusHotelId', 'amadeus_hotel_id'),
      },
    );
    return { result: `Alojamiento "${accommodation.name}" agregado al viaje. ID: ${accommodation.id}` };
  }

  @Post('add_itinerary_item')
  async addItineraryItem(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`add_itinerary_item: ${JSON.stringify(p)}`);
    const userId = this.getUserId(req);
    const rawId = this.p(p, 'tripId', 'trip_id');
    const tripId = await this.trips.resolveTripId(userId, rawId);
    if (!tripId) {
      return { result: `No encontré el viaje "${rawId}". Llama a get_my_trips para obtener el trip_id correcto.` };
    }
    const item = await this.trips.addItineraryItem(
      tripId,
      userId,
      {
        date: p.date,
        type: p.type,
        title: p.title,
        description: p.description ?? p.notes,
        location: p.location,
        startTime: this.p(p, 'startTime', 'start_time'),
        endTime: this.p(p, 'endTime', 'end_time'),
        cost: this.p(p, 'cost', 'price'),
        currency: p.currency,
      },
    );
    return { result: `"${item.title}" agregado al itinerario. ID: ${item.id}` };
  }

  @Post('search_web')
  async searchWeb(@Body() body: any) {
    const p = this.params(body);
    this.logger.log(`search_web: ${JSON.stringify(p)}`);
    try {
      const results = await this.webSearch.search(p.query, 5);
      if (results.length === 0) {
        return { result: `No encontré resultados en internet para "${p.query}".` };
      }
      const items = results.map((r, i) => ({
        id: `web-${i}`,
        title: r.title,
        subtitle: r.url,
        detail: r.description,
        imageUrl: r.imageUrl ?? undefined,
      }));
      const summary = `Encontré ${results.length} resultado(s) sobre "${p.query}": ${items.slice(0, 3).map((i) => i.title).join(', ')}`;
      return { result: JSON.stringify({ summary, items }) };
    } catch (e) {
      return { result: `Error buscando en internet: ${e.message}` };
    }
  }

  @Post('save_memory')
  async saveMemory(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`save_memory: ${JSON.stringify(p)}`);

    const VALID_CATEGORIES = ['PREFERENCE', 'NOTE', 'FACT'];
    const rawCategory = (p.category ?? 'NOTE').toString().trim().toUpperCase();
    const category = VALID_CATEGORIES.includes(rawCategory) ? rawCategory : 'NOTE';

    const content = (p.content ?? '').toString().trim();
    if (!content) {
      return { result: 'No se proporcionó contenido para guardar.' };
    }

    try {
      await this.memory.saveMemory(this.getUserId(req), content, category);
      this.logger.log(`Memory saved [${category}]: "${content}"`);
      return { result: `Guardado.` };
    } catch (e) {
      this.logger.error(`save_memory failed: ${e.message}`, e.stack);
      return { result: `Error guardando en memoria: ${e.message}` };
    }
  }

  @Post('recall_memory')
  async recallMemory(@Req() req: Request, @Body() body: any) {
    const p = this.params(body);
    this.logger.log(`recall_memory: ${JSON.stringify(p)}`);
    try {
      const memories = await this.memory.searchMemories(
        this.getUserId(req),
        p.query,
        5,
      );
      if (memories.length === 0) {
        return { result: 'No encontré información relevante en mi memoria.' };
      }
      return {
        result: {
          message: `Encontré ${memories.length} recuerdo(s) relevantes`,
          memories: memories.map((m) => ({
            content: m.content,
            category: m.category,
          })),
        },
      };
    } catch (e) {
      return { result: `Error buscando en memoria: ${e.message}` };
    }
  }
}
