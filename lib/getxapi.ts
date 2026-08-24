/**
 * Server-Side GetXAPI Client
 * 
 * Handles all communications with the external GetXAPI Twitter Trends service.
 * The GETXAPI_API_KEY is kept strictly server-side and never exposed to the client.
 */

import { LocationConfig, TrendItem, TrendsApiResponse } from '@/types/trends';
import { getLocationBySlug, normalizeLocationSlug } from './locations';
import { normalizeTrends } from './normalizer';
import { generateDemoTrends } from './demo-data';

const GETXAPI_BASE_URL = 'https://api.getxapi.com/twitter/trends';
const REQUEST_TIMEOUT_MS = 8000;

export interface GetXApiFetchResult {
  data?: unknown;
  isDemo: boolean;
  error?: string;
  statusCode?: number;
  rateLimited?: boolean;
}

/**
 * Check if the server-side GETXAPI_API_KEY is configured
 */
export function isGetXApiConfigured(): boolean {
  const apiKey = process.env.GETXAPI_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GETXAPI_API_KEY');
}

/**
 * Fetch raw trends from GetXAPI with timeout and comprehensive error handling
 */
export async function fetchRawGetXApiTrends(
  location: LocationConfig,
  limit: number = 50
): Promise<GetXApiFetchResult> {
  const apiKey = process.env.GETXAPI_API_KEY;

  if (!apiKey || apiKey === 'MY_GETXAPI_API_KEY' || apiKey.trim() === '') {
    // Demo Mode fallback
    return {
      data: generateDemoTrends(location.slug, limit),
      isDemo: true,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Construct URL with location identifiers (woeid or location slug)
    const url = new URL(GETXAPI_BASE_URL);
    if (location.woeid) {
      url.searchParams.set('woeid', String(location.woeid));
      url.searchParams.set('id', String(location.woeid));
    }
    url.searchParams.set('location', location.slug);
    if (location.code && location.code !== 'GLOBAL') {
      url.searchParams.set('country', location.code);
    }
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Accept': 'application/json',
        'User-Agent': 'TrendScope-Intelligence/1.0',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      return {
        isDemo: false,
        rateLimited: true,
        statusCode: 429,
        error: 'Trend provider rate limit reached. Please try again later.',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        isDemo: true, // Fallback to demo so user still gets a working dashboard
        statusCode: response.status,
        data: generateDemoTrends(location.slug, limit),
        error: 'Invalid or unauthorized GETXAPI_API_KEY. Using demo data fallback.',
      };
    }

    if (!response.ok) {
      return {
        isDemo: true,
        statusCode: response.status,
        data: generateDemoTrends(location.slug, limit),
        error: `GetXAPI returned status ${response.status}. Using demo data.`,
      };
    }

    const json = await response.json();
    return {
      data: json,
      isDemo: false,
      statusCode: response.status,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    const isAbort = err instanceof Error && err.name === 'AbortError';
    const message = isAbort
      ? 'GetXAPI request timed out. Using fallback data.'
      : 'Network error communicating with GetXAPI. Using fallback data.';

    return {
      data: generateDemoTrends(location.slug, limit),
      isDemo: true,
      error: message,
    };
  }
}

/**
 * Main Service Function: Fetch and normalize trends for a location
 */
export async function getTrendsForLocation(
  locationInput: string,
  limit: number = 50
): Promise<TrendsApiResponse> {
  const normalizedSlug = normalizeLocationSlug(locationInput);
  const location = getLocationBySlug(normalizedSlug);

  const fetchResult = await fetchRawGetXApiTrends(location, limit);

  if (fetchResult.rateLimited) {
    return {
      success: false,
      location: {
        name: location.name,
        slug: location.slug,
        code: location.code,
      },
      updatedAt: new Date().toISOString(),
      count: 0,
      trends: [],
      isDemo: false,
      error: fetchResult.error || 'Trend provider rate limit reached. Please try again later.',
      source: 'getxapi',
    };
  }

  const normalizedItems: TrendItem[] = normalizeTrends(fetchResult.data, location.slug);
  const finalTrends = normalizedItems.slice(0, limit);

  return {
    success: true,
    location: {
      name: location.name,
      slug: location.slug,
      code: location.code,
    },
    updatedAt: new Date().toISOString(),
    count: finalTrends.length,
    trends: finalTrends,
    isDemo: fetchResult.isDemo,
    source: fetchResult.isDemo ? 'demo' : 'getxapi',
    error: fetchResult.error,
  };
}
