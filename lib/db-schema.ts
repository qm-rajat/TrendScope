/**
 * SQLite Architecture and Database Schema Specification
 * 
 * Provides table schemas, DDL definitions, and Data Access Object (DAO)
 * interfaces for future SQLite historical snapshot storage and scheduled
 * trend collection jobs.
 */

export const SQLITE_SCHEMA_DDL = `
-- Locations monitored by TrendScope
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL,
  provider_location_id TEXT,
  region TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled snapshots collected every 30 mins
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location_id INTEGER NOT NULL,
  collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'completed',
  trend_count INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
);

-- Individual trends recorded per snapshot
CREATE TABLE IF NOT EXISTS trends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('hashtag', 'topic')),
  tweet_volume INTEGER,
  query TEXT NOT NULL,
  search_url TEXT NOT NULL,
  promoted INTEGER NOT NULL DEFAULT 0,
  change INTEGER DEFAULT 0,
  previous_rank INTEGER,
  velocity_status TEXT,
  FOREIGN KEY (snapshot_id) REFERENCES trend_snapshots (id) ON DELETE CASCADE
);

-- Indexes for high-speed historical queries
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations (slug);
CREATE INDEX IF NOT EXISTS idx_snapshots_location_time ON trend_snapshots (location_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_trends_snapshot ON trends (snapshot_id);
CREATE INDEX IF NOT EXISTS idx_trends_name ON trends (name);
`;

export interface TrendRepository {
  initDb(): Promise<void>;
  saveSnapshot(locationSlug: string, trends: unknown[]): Promise<number>;
  getLatestSnapshot(locationSlug: string): Promise<unknown | null>;
  getTrendHistory(trendName: string, locationSlug: string, limit?: number): Promise<unknown[]>;
}
