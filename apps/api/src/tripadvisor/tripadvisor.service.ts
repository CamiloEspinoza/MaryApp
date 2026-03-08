import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TripAdvisorService {
  private readonly logger = new Logger(TripAdvisorService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.content.tripadvisor.com/api/v1/location';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.getOrThrow<string>('TRIPADVISOR_API_KEY');
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('language', 'es');
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`TripAdvisor ${path} failed: ${res.status} ${body}`);
      throw new Error(`TripAdvisor API error: ${res.status}`);
    }

    return res.json();
  }

  async getFirstPhoto(locationId: string): Promise<string | null> {
    try {
      const data = await this.request<any>(`/${locationId}/photos`, { limit: '1' });
      const images = data.data?.[0]?.images;
      return images?.medium?.url ?? images?.small?.url ?? images?.thumbnail?.url ?? null;
    } catch {
      return null;
    }
  }

  async searchPlaces(query: string, latLong?: string) {
    const params: Record<string, string> = { searchQuery: query };
    if (latLong) params.latLong = latLong;

    const data = await this.request<any>('/search', params);
    const places = (data.data ?? []).slice(0, 5);

    // Fetch first photo for each place in parallel
    const photoResults = await Promise.allSettled(
      places.map((loc: any) => this.getFirstPhoto(loc.location_id)),
    );

    return places.map((loc: any, i: number) => ({
      locationId: loc.location_id,
      name: loc.name,
      address: loc.address_obj?.address_string,
      category: loc.category?.name,
      rating: loc.rating,
      photoUrl: photoResults[i].status === 'fulfilled' ? photoResults[i].value : null,
    }));
  }

  async getLocationDetails(locationId: string) {
    const data = await this.request<any>(`/${locationId}/details`);

    return {
      locationId: data.location_id,
      name: data.name,
      description: data.description,
      address: data.address_obj?.address_string,
      rating: data.rating,
      numReviews: data.num_reviews,
      priceLevel: data.price_level,
      phone: data.phone,
      website: data.website,
      hours: data.hours?.weekday_text,
      category: data.category?.name,
      subcategories: data.subcategory?.map((s: any) => s.name),
    };
  }
}
