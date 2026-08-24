import { NextRequest, NextResponse } from 'next/server';
import { isGetXApiConfigured } from '@/lib/getxapi';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const customApiKey = request.headers.get('x-custom-api-key') || undefined;
  const configured = isGetXApiConfigured(customApiKey);
  const cacheStats = cache.getStats();

  return NextResponse.json({
    status: 'online',
    provider: configured ? 'GetXAPI' : 'Demo Mock Mode',
    isConfigured: configured,
    usingCustomKey: Boolean(customApiKey),
    authStatus: configured
      ? customApiKey
        ? 'Active (Custom User Key)'
        : 'Active (Environment Secret)'
      : 'Missing GETXAPI_API_KEY (Using Demo Mode)',
    cache: {
      activeEntries: cacheStats.totalEntries,
      defaultTtlSeconds: cacheStats.defaultTtlSeconds,
    },
    serverTime: new Date().toISOString(),
    version: '1.0.0',
  });
}
