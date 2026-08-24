import { NextRequest, NextResponse } from 'next/server';
import { getTrendsForLocation } from '@/lib/getxapi';
import { cache } from '@/lib/cache';
import { normalizeLocationSlug } from '@/lib/locations';
import { TrendsApiResponse } from '@/types/trends';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawLocation = searchParams.get('location') || 'worldwide';
    const limitParam = searchParams.get('limit');
    const forceRefresh = searchParams.get('force') === 'true' || searchParams.get('refresh') === 'true';

    // Sanitize and normalize location
    const locationSlug = normalizeLocationSlug(rawLocation);
    
    // Parse limit (clamp between 1 and 100, default 50)
    let limit = 50;
    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(100, Math.max(1, parsed));
      }
    }

    const cacheKey = `trends:${locationSlug}:${limit}`;

    // 1. Check cache if not forcing refresh
    if (!forceRefresh) {
      const cached = cache.get<TrendsApiResponse>(cacheKey);
      if (cached) {
        return NextResponse.json(
          {
            ...cached.data,
            cached: true,
            cacheAgeSeconds: cached.ageSeconds,
          },
          {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
              'X-Cache-Status': 'HIT',
            },
          }
        );
      }
    }

    // 2. Fetch fresh trends via server-side GetXAPI module
    const responseData = await getTrendsForLocation(locationSlug, limit);

    if (!responseData.success) {
      return NextResponse.json(
        {
          success: false,
          location: responseData.location,
          updatedAt: responseData.updatedAt,
          count: 0,
          trends: [],
          error: responseData.error || 'Failed to retrieve trends for location',
        },
        { status: 429 }
      );
    }

    // 3. Store in server-side cache (5 minutes TTL)
    cache.set(cacheKey, responseData, 300);

    // 4. Return clean normalised response
    return NextResponse.json(
      {
        ...responseData,
        cached: false,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache-Status': 'MISS',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'An internal server error occurred while retrieving trends.',
      },
      { status: 500 }
    );
  }
}
