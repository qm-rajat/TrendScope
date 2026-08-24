export type TrendType = 'hashtag' | 'topic';

export type TrendStatus = 'EXPLODING' | 'RISING' | 'STABLE' | 'FALLING' | 'COOLING';

export interface TrendItem {
  rank: number;
  name: string;
  type: TrendType;
  tweetVolume: number | null;
  query: string;
  searchUrl: string;
  promoted: boolean;
  change?: number; // e.g. +18 positions, -5 positions, 0
  previousRank?: number | null;
  firstSeen?: string; // e.g. "12 min ago"
  status?: TrendStatus;
  velocityScore?: number;
  category?: string;
  sampleTweetsSnippet?: string;
}

export interface LocationConfig {
  name: string;
  slug: string;
  code: string;
  woeid?: number;
  region?: string;
  flag?: string;
  popular?: boolean;
}

export interface TrendsApiResponse {
  success: boolean;
  location: {
    name: string;
    slug: string;
    code?: string;
  };
  updatedAt: string;
  count: number;
  trends: TrendItem[];
  isDemo?: boolean;
  cached?: boolean;
  cacheAgeSeconds?: number;
  error?: string;
  source?: 'getxapi' | 'cache' | 'demo';
}

export interface HistoricalSnapshot {
  timestamp: string; // ISO string
  timeLabel: string; // "10:00", "10:30", etc.
  rank: number;
  tweetVolume: number | null;
}

export interface TrendHistoryRecord {
  name: string;
  query: string;
  locationSlug: string;
  currentRank: number;
  peakRank: number;
  type: TrendType;
  history: HistoricalSnapshot[];
}

export interface CountryComparisonItem {
  name: string;
  type: TrendType;
  query: string;
  searchUrl: string;
  country1Rank: number | null;
  country2Rank: number | null;
  country1Volume: number | null;
  country2Volume: number | null;
  isCrossCountry: boolean;
}

// Database schema abstractions for future SQLite migration
export interface DbLocation {
  id: number;
  name: string;
  slug: string;
  country_code: string;
  provider_location_id: string | null;
  active: boolean;
  created_at: string;
}

export interface DbTrendSnapshot {
  id: number;
  location_id: number;
  collected_at: string;
  status: string;
  trend_count: number;
}

export interface DbTrend {
  id: number;
  snapshot_id: number;
  rank: number;
  name: string;
  type: string;
  tweet_volume: number | null;
  query: string;
  search_url: string;
  promoted: boolean;
}
