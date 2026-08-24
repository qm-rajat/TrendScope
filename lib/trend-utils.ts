import { TrendItem, TrendStatus, TrendType, CountryComparisonItem } from '@/types/trends';

/**
 * Format raw tweet numbers to human readable string (e.g. 125K, 1.4M)
 */
export function formatTweetVolume(volume: number | null | undefined): string {
  if (volume === null || volume === undefined || volume <= 0) {
    return 'Under 10K';
  }
  if (volume >= 1_000_000) {
    const formatted = (volume / 1_000_000).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}M`;
  }
  if (volume >= 10_000) {
    const formatted = (volume / 1_000).toFixed(1);
    return `${formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted}K`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toLocaleString();
}

/**
 * Clean and detect if a trend name is a hashtag or topic
 */
export function detectTrendType(name: string): TrendType {
  const trimmed = name.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('＃')) {
    return 'hashtag';
  }
  return 'topic';
}

/**
 * Build external X (Twitter) search URL
 */
export function buildXSearchUrl(name: string, query?: string): string {
  const isHash = detectTrendType(name);
  if (isHash) {
    const cleanTag = name.replace(/^[#＃]/, '');
    return `https://x.com/hashtag/${encodeURIComponent(cleanTag)}`;
  }
  const searchQuery = query || name;
  return `https://x.com/search?q=${encodeURIComponent(searchQuery)}`;
}

/**
 * Calculate velocity classification based on rank change and volume
 */
export function calculateTrendStatus(change: number | undefined, rank: number): TrendStatus {
  if (change === undefined) {
    if (rank <= 3) return 'RISING';
    if (rank <= 10) return 'STABLE';
    return 'STABLE';
  }

  if (change >= 20 || (rank <= 5 && change >= 10)) {
    return 'EXPLODING';
  }
  if (change >= 4) {
    return 'RISING';
  }
  if (change <= -20) {
    return 'COOLING';
  }
  if (change <= -5) {
    return 'FALLING';
  }
  return 'STABLE';
}

/**
 * Calculate status badge colors and visual styling tokens
 */
export function getStatusTheme(status: TrendStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  iconName: string;
} {
  switch (status) {
    case 'EXPLODING':
      return {
        label: 'EXPLODING',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        iconName: 'Flame',
      };
    case 'RISING':
      return {
        label: 'RISING',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        iconName: 'TrendingUp',
      };
    case 'COOLING':
      return {
        label: 'COOLING',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        iconName: 'TrendingDown',
      };
    case 'FALLING':
      return {
        label: 'FALLING',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        iconName: 'ArrowDownRight',
      };
    case 'STABLE':
    default:
      return {
        label: 'STABLE',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        iconName: 'Minus',
      };
  }
}

/**
 * Format relative time string from ISO timestamp or minutes ago
 */
export function formatTimeAgo(isoStringOrMinutes: string | number): string {
  if (typeof isoStringOrMinutes === 'number') {
    if (isoStringOrMinutes < 1) return 'Just now';
    if (isoStringOrMinutes === 1) return '1 min ago';
    if (isoStringOrMinutes < 60) return `${isoStringOrMinutes} min ago`;
    const hours = Math.floor(isoStringOrMinutes / 60);
    return hours === 1 ? '1 hr ago' : `${hours} hrs ago`;
  }

  try {
    const past = new Date(isoStringOrMinutes).getTime();
    const now = Date.now();
    const diffSecs = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Compare two sets of country trends to find overlaps and ranking differentials
 */
export function compareCountryTrends(
  country1Trends: TrendItem[],
  country2Trends: TrendItem[]
): {
  comparisons: CountryComparisonItem[];
  crossCountryCount: number;
  country1Exclusive: number;
  country2Exclusive: number;
} {
  const map2 = new Map<string, TrendItem>();
  for (const t of country2Trends) {
    const key = t.name.trim().toLowerCase();
    map2.set(key, t);
  }

  const seen = new Set<string>();
  const comparisons: CountryComparisonItem[] = [];
  let crossCountryCount = 0;

  for (const t1 of country1Trends) {
    const key = t1.name.trim().toLowerCase();
    seen.add(key);
    const t2 = map2.get(key);

    const isCross = !!t2;
    if (isCross) crossCountryCount++;

    comparisons.push({
      name: t1.name,
      type: t1.type,
      query: t1.query,
      searchUrl: t1.searchUrl,
      country1Rank: t1.rank,
      country2Rank: t2 ? t2.rank : null,
      country1Volume: t1.tweetVolume,
      country2Volume: t2 ? t2.tweetVolume : null,
      isCrossCountry: isCross,
    });
  }

  // Add items present only in Country 2
  for (const t2 of country2Trends) {
    const key = t2.name.trim().toLowerCase();
    if (!seen.has(key)) {
      comparisons.push({
        name: t2.name,
        type: t2.type,
        query: t2.query,
        searchUrl: t2.searchUrl,
        country1Rank: null,
        country2Rank: t2.rank,
        country1Volume: null,
        country2Volume: t2.tweetVolume,
        isCrossCountry: false,
      });
    }
  }

  // Sort: cross-country items first, then by country 1 rank, then by country 2 rank
  comparisons.sort((a, b) => {
    if (a.isCrossCountry && !b.isCrossCountry) return -1;
    if (!a.isCrossCountry && b.isCrossCountry) return 1;
    const rankA = a.country1Rank ?? 999;
    const rankB = b.country1Rank ?? 999;
    return rankA - rankB;
  });

  const country1Exclusive = country1Trends.length - crossCountryCount;
  const country2Exclusive = country2Trends.length - crossCountryCount;

  return {
    comparisons,
    crossCountryCount,
    country1Exclusive,
    country2Exclusive,
  };
}
