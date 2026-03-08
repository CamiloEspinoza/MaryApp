import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WebResult {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
}

@Injectable()
export class WebSearchService {
  private readonly logger = new Logger(WebSearchService.name);

  constructor(private config: ConfigService) {}

  async search(query: string, count = 5): Promise<WebResult[]> {
    const apiKey = this.config.get<string>('BRAVE_SEARCH_API_KEY');

    if (!apiKey || apiKey === 'change-me') {
      throw new Error(
        'BRAVE_SEARCH_API_KEY no está configurada. Consigue una clave gratuita en https://brave.com/search/api/',
      );
    }

    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}&search_lang=es&country=es`;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Brave Search failed: ${res.status} ${body}`);
      throw new Error(`Web search failed: ${res.status}`);
    }

    const data = await res.json();
    const results: WebResult[] = (data.web?.results ?? []).map((r: any) => ({
      title: r.title ?? '',
      url: r.url ?? '',
      description: r.description ?? r.extra_snippets?.[0] ?? '',
      imageUrl: r.thumbnail?.src ?? undefined,
    }));

    this.logger.log(`Brave Search "${query}": ${results.length} results`);
    return results;
  }
}
