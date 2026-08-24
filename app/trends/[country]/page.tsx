import type { Metadata } from 'next';
import { getLocationBySlug, normalizeLocationSlug } from '@/lib/locations';
import { CountryClientView } from './CountryClientView';

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { country } = await params;
  const normalized = normalizeLocationSlug(country);
  const location = getLocationBySlug(normalized);

  const title = `${location.name} X Trends Today | TrendScope`;
  const description = `See the latest trending topics and hashtags on X in ${location.name}, including rankings, velocity, and emerging trends.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { country } = await params;
  const normalized = normalizeLocationSlug(country);

  return <CountryClientView countrySlug={normalized} />;
}
