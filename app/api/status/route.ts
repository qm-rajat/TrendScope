import { NextResponse } from 'next/server';
import { isGetXApiConfigured } from '@/lib/getxapi';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = isGetXApiConfigured();
  const cacheStats = cache.getStats();

  return NextResponse.json({
    status: 'online',
    provider: configured ? 'GetXAPI' : 'Demo Mock Mode',
    isConfigured: configured,
    authStatus: configured ? 'Configured' : 'Missing GETXAPI_API_KEY',
    cache: {
      activeEntries: cacheStats.totalEntries,
      defaultTtlSeconds: cacheStats.defaultTtlSeconds,
    },
    serverTime: new Date().toISOString(),
    version: '1.0.0',
  });
}
