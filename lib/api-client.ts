/**
 * Client-Side API Helper with Custom Key Forwarding & Telemetry
 */

import { recordApiCall } from './telemetry';
import { TrendsApiResponse } from '@/types/trends';

const CUSTOM_KEY_STORAGE_KEY = 'trendscope_custom_api_key';

export function getCustomApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = localStorage.getItem(CUSTOM_KEY_STORAGE_KEY);
    return key && key.trim().length > 0 ? key.trim() : null;
  } catch {
    return null;
  }
}

export async function fetchTrendsData(
  locationSlug: string,
  limit: number = 50,
  forceRefresh: boolean = false
): Promise<TrendsApiResponse> {
  const customKey = getCustomApiKey();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (customKey) {
    headers['x-custom-api-key'] = customKey;
  }

  const endpoint = `/api/trends?location=${encodeURIComponent(locationSlug)}&limit=${limit}${
    forceRefresh ? '&force=true' : ''
  }`;

  const startTime = performance.now();

  try {
    const res = await fetch(endpoint, {
      headers,
      cache: 'no-store',
    });

    const endTime = performance.now();
    const latencyMs = Math.max(1, Math.round(endTime - startTime));

    if (!res.ok) {
      recordApiCall(
        endpoint,
        locationSlug,
        res.status,
        latencyMs,
        false,
        'getxapi',
        Boolean(customKey)
      );

      if (res.status === 429) {
        throw new Error('Trend provider rate limit reached. Please try again later.');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const json: TrendsApiResponse = await res.json();

    // Log telemetry
    recordApiCall(
      endpoint,
      locationSlug,
      res.status,
      latencyMs,
      Boolean(json.cached),
      json.source || 'getxapi',
      Boolean(customKey)
    );

    return json;
  } catch (err) {
    const endTime = performance.now();
    const latencyMs = Math.max(1, Math.round(endTime - startTime));
    recordApiCall(
      endpoint,
      locationSlug,
      500,
      latencyMs,
      false,
      'demo',
      Boolean(customKey)
    );
    throw err;
  }
}
