import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface MemoryRow {
  id: string;
  category: string;
  content: string;
  createdAt: Date;
  similarity?: number;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private readonly openaiKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.openaiKey = this.config.getOrThrow<string>('OPENAI_API_KEY');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`OpenAI embeddings failed: ${res.status} ${body}`);
      throw new Error('Failed to generate embedding');
    }

    const data = await res.json();
    return data.data[0].embedding;
  }

  async saveMemory(userId: string, content: string, category: string) {
    const embedding = await this.generateEmbedding(content);
    const vectorStr = `[${embedding.join(',')}]`;

    const result = await this.prisma.$queryRawUnsafe<MemoryRow[]>(
      `INSERT INTO "Memory" (id, category, content, embedding, "userId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1::"MemoryCategory", $2, $3::vector, $4, NOW(), NOW())
       RETURNING id, category, content, "createdAt"`,
      category,
      content,
      vectorStr,
      userId,
    );

    this.logger.log(`Memory saved for user ${userId}: ${content.substring(0, 50)}`);
    return result[0];
  }

  async searchMemories(userId: string, query: string, limit = 5): Promise<MemoryRow[]> {
    const embedding = await this.generateEmbedding(query);
    const vectorStr = `[${embedding.join(',')}]`;

    const results = await this.prisma.$queryRawUnsafe<MemoryRow[]>(
      `SELECT id, category, content, "createdAt",
              1 - (embedding <=> $1::vector) as similarity
       FROM "Memory"
       WHERE "userId" = $2
         AND embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      vectorStr,
      userId,
      limit,
    );

    return results;
  }

  async getRecentMemories(userId: string, limit = 15): Promise<MemoryRow[]> {
    return this.prisma.$queryRawUnsafe<MemoryRow[]>(
      `SELECT id, category, content, "createdAt"
       FROM "Memory"
       WHERE "userId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2`,
      userId,
      limit,
    );
  }

  async getUserContext(userId: string) {
    const [trips, memories] = await Promise.all([
      this.prisma.trip.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          destination: true,
          status: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.getRecentMemories(userId, 15),
    ]);

    return { trips, memories };
  }
}
