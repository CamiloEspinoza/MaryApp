import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AmadeusToken {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private token: AmadeusToken | null = null;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.getOrThrow<string>('AMADEUS_BASE_URL');
    this.clientId = this.config.getOrThrow<string>('AMADEUS_CLIENT_ID');
    this.clientSecret = this.config.getOrThrow<string>('AMADEUS_CLIENT_SECRET');
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token.accessToken;
    }

    const res = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Amadeus auth failed: ${res.status} ${body}`);
      throw new Error('Failed to authenticate with Amadeus');
    }

    const data = await res.json();
    this.token = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return this.token.accessToken;
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const token = await this.getAccessToken();
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Amadeus ${path} failed: ${res.status} ${body}`);
      throw new Error(`Amadeus API error: ${res.status}`);
    }

    return res.json();
  }

  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    adults: number = 1,
    returnDate?: string,
  ) {
    const params: Record<string, string> = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults: String(adults),
      max: '5',
      currencyCode: 'USD',
    };
    if (returnDate) params.returnDate = returnDate;

    const data = await this.request<any>('/v2/shopping/flight-offers', params);

    return (data.data ?? []).slice(0, 5).map((offer: any) => ({
      id: offer.id,
      price: offer.price?.total,
      currency: offer.price?.currency,
      itineraries: offer.itineraries?.map((it: any) => ({
        duration: it.duration,
        segments: it.segments?.map((seg: any) => ({
          departure: { airport: seg.departure?.iataCode, time: seg.departure?.at },
          arrival: { airport: seg.arrival?.iataCode, time: seg.arrival?.at },
          carrier: seg.carrierCode,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          duration: seg.duration,
        })),
      })),
    }));
  }

  async searchHotelsByCity(cityCode: string) {
    const data = await this.request<any>(
      '/v1/reference-data/locations/hotels/by-city',
      { cityCode: cityCode.toUpperCase(), radius: '20', radiusUnit: 'KM' },
    );

    return (data.data ?? []).slice(0, 10).map((h: any) => ({
      hotelId: h.hotelId,
      name: h.name,
      cityCode: h.address?.cityCode,
      latitude: h.geoCode?.latitude,
      longitude: h.geoCode?.longitude,
    }));
  }

  async searchHotelOffers(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
    adults: number = 1,
  ) {
    const data = await this.request<any>('/v3/shopping/hotel-offers', {
      hotelIds: hotelIds.slice(0, 5).join(','),
      checkInDate,
      checkOutDate,
      adults: String(adults),
      currency: 'USD',
    });

    return (data.data ?? []).slice(0, 5).map((hotel: any) => ({
      hotelId: hotel.hotel?.hotelId,
      name: hotel.hotel?.name,
      offers: hotel.offers?.slice(0, 2).map((o: any) => ({
        id: o.id,
        price: o.price?.total,
        currency: o.price?.currency,
        room: o.room?.description?.text,
        checkIn: o.checkInDate,
        checkOut: o.checkOutDate,
      })),
    }));
  }
}
