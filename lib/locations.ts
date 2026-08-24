import { LocationConfig } from '@/types/trends';

export const LOCATIONS: LocationConfig[] = [
  {
    name: 'Worldwide',
    slug: 'worldwide',
    code: 'GLOBAL',
    woeid: 1,
    region: 'Global',
    flag: '🌐',
    popular: true,
  },
  {
    name: 'India',
    slug: 'india',
    code: 'IN',
    woeid: 23424848,
    region: 'Asia',
    flag: '🇮🇳',
    popular: true,
  },
  {
    name: 'United States',
    slug: 'usa',
    code: 'US',
    woeid: 23424977,
    region: 'North America',
    flag: '🇺🇸',
    popular: true,
  },
  {
    name: 'United Kingdom',
    slug: 'uk',
    code: 'GB',
    woeid: 23424975,
    region: 'Europe',
    flag: '🇬🇧',
    popular: true,
  },
  {
    name: 'Japan',
    slug: 'japan',
    code: 'JP',
    woeid: 23424856,
    region: 'Asia',
    flag: '🇯🇵',
    popular: true,
  },
  {
    name: 'Canada',
    slug: 'canada',
    code: 'CA',
    woeid: 23424775,
    region: 'North America',
    flag: '🇨🇦',
    popular: true,
  },
  {
    name: 'Australia',
    slug: 'australia',
    code: 'AU',
    woeid: 23424748,
    region: 'Oceania',
    flag: '🇦🇺',
    popular: true,
  },
  {
    name: 'Germany',
    slug: 'germany',
    code: 'DE',
    woeid: 23424829,
    region: 'Europe',
    flag: '🇩🇪',
    popular: true,
  },
  {
    name: 'France',
    slug: 'france',
    code: 'FR',
    woeid: 23424819,
    region: 'Europe',
    flag: '🇫🇷',
    popular: true,
  },
  {
    name: 'Brazil',
    slug: 'brazil',
    code: 'BR',
    woeid: 23424768,
    region: 'South America',
    flag: '🇧🇷',
    popular: true,
  },
  {
    name: 'Mexico',
    slug: 'mexico',
    code: 'MX',
    woeid: 23424900,
    region: 'North America',
    flag: '🇲🇽',
    popular: false,
  },
  {
    name: 'Singapore',
    slug: 'singapore',
    code: 'SG',
    woeid: 23424948,
    region: 'Asia',
    flag: '🇸🇬',
    popular: true,
  },
  {
    name: 'UAE',
    slug: 'uae',
    code: 'AE',
    woeid: 23424738,
    region: 'Middle East',
    flag: '🇦🇪',
    popular: false,
  },
  {
    name: 'Saudi Arabia',
    slug: 'saudi-arabia',
    code: 'SA',
    woeid: 23424938,
    region: 'Middle East',
    flag: '🇸🇦',
    popular: false,
  },
  {
    name: 'South Africa',
    slug: 'south-africa',
    code: 'ZA',
    woeid: 23424942,
    region: 'Africa',
    flag: '🇿🇦',
    popular: false,
  },
  {
    name: 'Spain',
    slug: 'spain',
    code: 'ES',
    woeid: 23424950,
    region: 'Europe',
    flag: '🇪🇸',
    popular: false,
  },
  {
    name: 'Italy',
    slug: 'italy',
    code: 'IT',
    woeid: 23424853,
    region: 'Europe',
    flag: '🇮🇹',
    popular: false,
  },
  {
    name: 'Netherlands',
    slug: 'netherlands',
    code: 'NL',
    woeid: 23424909,
    region: 'Europe',
    flag: '🇳🇱',
    popular: false,
  },
  {
    name: 'South Korea',
    slug: 'south-korea',
    code: 'KR',
    woeid: 23424868,
    region: 'Asia',
    flag: '🇰🇷',
    popular: false,
  },
  {
    name: 'Indonesia',
    slug: 'indonesia',
    code: 'ID',
    woeid: 23424846,
    region: 'Asia',
    flag: '🇮🇩',
    popular: false,
  },
];

export const DEFAULT_LOCATION = LOCATIONS[0]; // Worldwide

export function normalizeLocationSlug(input: string | null | undefined): string {
  if (!input) return 'worldwide';
  const clean = input.trim().toLowerCase();
  
  // Aliases mapping
  const aliases: Record<string, string> = {
    'us': 'usa',
    'united-states': 'usa',
    'unitedstates': 'usa',
    'global': 'worldwide',
    'world': 'worldwide',
    'gb': 'uk',
    'united-kingdom': 'uk',
    'unitedkingdom': 'uk',
    'great-britain': 'uk',
    'in': 'india',
    'jp': 'japan',
    'ca': 'canada',
    'au': 'australia',
    'de': 'germany',
    'fr': 'france',
    'br': 'brazil',
    'mx': 'mexico',
    'sg': 'singapore',
    'ae': 'uae',
    'sa': 'saudi-arabia',
    'za': 'south-africa',
    'es': 'spain',
    'it': 'italy',
    'nl': 'netherlands',
    'kr': 'south-korea',
    'id': 'indonesia',
  };

  if (aliases[clean]) return aliases[clean];

  return clean;
}

export function getLocationBySlug(slug: string): LocationConfig {
  const normalized = normalizeLocationSlug(slug);
  const found = LOCATIONS.find((loc) => loc.slug === normalized);
  if (found) return found;

  // Fallback constructed location if not in primary list
  return {
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    slug: normalized,
    code: normalized.slice(0, 2).toUpperCase(),
    region: 'Global',
    flag: '📍',
    popular: false,
  };
}

export function getAllLocations(): LocationConfig[] {
  return LOCATIONS;
}

export function getPopularLocations(): LocationConfig[] {
  return LOCATIONS.filter((loc) => loc.popular);
}

export function isValidLocation(slug: string): boolean {
  const normalized = normalizeLocationSlug(slug);
  return LOCATIONS.some((loc) => loc.slug === normalized);
}
