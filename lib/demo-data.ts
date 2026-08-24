/**
 * Realistic Trend Data Generator for Demo Mode
 * 
 * Activated automatically when GETXAPI_API_KEY is not set or during API fallback.
 * Generates tailored, location-specific trending topics, hashtags, and tweet volumes.
 */

import { RawGetXApiTrend } from './normalizer';

const LOCATION_DEMO_TOPICS: Record<
  string,
  Array<{ name: string; type: 'hashtag' | 'topic'; volume: number; category: string }>
> = {
  worldwide: [
    { name: '#WorldCup2026', type: 'hashtag', volume: 840000, category: 'Sports' },
    { name: '#ArtificialIntelligence', type: 'hashtag', volume: 620000, category: 'Technology' },
    { name: 'SpaceX Starship', type: 'topic', volume: 490000, category: 'Science' },
    { name: '#TechInnovation', type: 'hashtag', volume: 380000, category: 'Tech' },
    { name: 'Champions League', type: 'topic', volume: 350000, category: 'Sports' },
    { name: '#GlobalClimateSummit', type: 'hashtag', volume: 310000, category: 'News' },
    { name: 'Apple Vision Pro 2', type: 'topic', volume: 290000, category: 'Technology' },
    { name: '#MondayMotivation', type: 'hashtag', volume: 275000, category: 'Lifestyle' },
    { name: 'OpenAI GPT-5', type: 'topic', volume: 260000, category: 'AI' },
    { name: '#NewMusicFriday', type: 'hashtag', volume: 245000, category: 'Entertainment' },
    { name: 'Nvidia RTX 5090', type: 'topic', volume: 230000, category: 'Gaming' },
    { name: '#CryptoMarket', type: 'hashtag', volume: 215000, category: 'Finance' },
    { name: 'Formula 1 Grand Prix', type: 'topic', volume: 198000, category: 'Sports' },
    { name: '#CyberSecurityAlert', type: 'hashtag', volume: 185000, category: 'Tech' },
    { name: 'Tesla Robotaxi', type: 'topic', volume: 172000, category: 'Automotive' },
    { name: '#QuantumComputing', type: 'hashtag', volume: 160000, category: 'Science' },
    { name: 'Steam Summer Sale', type: 'topic', volume: 148000, category: 'Gaming' },
    { name: '#RenewableEnergy', type: 'hashtag', volume: 135000, category: 'Environment' },
    { name: 'James Webb Telescope', type: 'topic', volume: 120000, category: 'Space' },
    { name: '#DevCommunity', type: 'hashtag', volume: 110000, category: 'Coding' },
  ],
  india: [
    { name: '#TeamIndia', type: 'hashtag', volume: 780000, category: 'Cricket' },
    { name: '#IPL2026', type: 'hashtag', volume: 640000, category: 'Cricket' },
    { name: 'Chandrayaan 4', type: 'topic', volume: 520000, category: 'Space & Tech' },
    { name: '#DigitalIndia', type: 'hashtag', volume: 430000, category: 'Technology' },
    { name: 'Virat Kohli', type: 'topic', volume: 390000, category: 'Sports' },
    { name: '#StartupIndia', type: 'hashtag', volume: 310000, category: 'Business' },
    { name: 'UPI Global', type: 'topic', volume: 280000, category: 'Finance' },
    { name: '#BollywoodBuzz', type: 'hashtag', volume: 260000, category: 'Entertainment' },
    { name: 'ISRO Gaganyaan', type: 'topic', volume: 240000, category: 'Science' },
    { name: '#IndianTech', type: 'hashtag', volume: 210000, category: 'Technology' },
    { name: 'Rohit Sharma', type: 'topic', volume: 195000, category: 'Cricket' },
    { name: '#StockMarketIndia', type: 'hashtag', volume: 180000, category: 'Finance' },
    { name: 'AI in Agriculture', type: 'topic', volume: 165000, category: 'Gov & Tech' },
    { name: '#VandeBharatExpress', type: 'hashtag', volume: 150000, category: 'Infrastructure' },
    { name: 'Kolkata Knight Riders', type: 'topic', volume: 135000, category: 'Sports' },
    { name: '#Budget2026', type: 'hashtag', volume: 125000, category: 'Politics' },
    { name: 'Deepika Padukone', type: 'topic', volume: 115000, category: 'Cinema' },
    { name: '#BengaluruTech', type: 'hashtag', volume: 98000, category: 'Startups' },
  ],
  usa: [
    { name: '#SuperBowlLXI', type: 'hashtag', volume: 920000, category: 'Sports' },
    { name: 'Federal Reserve Rate Cut', type: 'topic', volume: 680000, category: 'Economy' },
    { name: '#SiliconValleyAI', type: 'hashtag', volume: 550000, category: 'Tech' },
    { name: 'NASA Artemis 3', type: 'topic', volume: 480000, category: 'Space' },
    { name: '#USOpenTennis', type: 'hashtag', volume: 410000, category: 'Sports' },
    { name: 'Taylor Swift Eras Tour', type: 'topic', volume: 390000, category: 'Music' },
    { name: '#WallStreetJournal', type: 'hashtag', volume: 340000, category: 'Finance' },
    { name: 'NBA Finals MVP', type: 'topic', volume: 320000, category: 'Basketball' },
    { name: '#HollywoodPremiere', type: 'hashtag', volume: 290000, category: 'Movies' },
    { name: 'Anthropic Claude 4', type: 'topic', volume: 275000, category: 'AI' },
    { name: '#SundayNightFootball', type: 'hashtag', volume: 250000, category: 'NFL' },
    { name: 'EV Tax Incentives', type: 'topic', volume: 220000, category: 'Policy' },
    { name: '#CES2027', type: 'hashtag', volume: 205000, category: 'Gadgets' },
    { name: 'Broadway Revival', type: 'topic', volume: 175000, category: 'Culture' },
    { name: '#CyberDefense', type: 'hashtag', volume: 160000, category: 'Security' },
  ],
  uk: [
    { name: '#PremierLeague', type: 'hashtag', volume: 750000, category: 'Football' },
    { name: 'Wimbledon Championships', type: 'topic', volume: 530000, category: 'Tennis' },
    { name: '#BBCNews', type: 'hashtag', volume: 420000, category: 'Current Affairs' },
    { name: 'Bank of England', type: 'topic', volume: 360000, category: 'Finance' },
    { name: '#Glastonbury2026', type: 'hashtag', volume: 310000, category: 'Music' },
    { name: 'Arsenal vs Man City', type: 'topic', volume: 290000, category: 'Sports' },
    { name: '#LondonTechWeek', type: 'hashtag', volume: 240000, category: 'Technology' },
    { name: 'King Charles III', type: 'topic', volume: 220000, category: 'Royalty' },
    { name: '#GreatBritishBakeOff', type: 'hashtag', volume: 195000, category: 'TV' },
    { name: 'Westminster Parliament', type: 'topic', volume: 175000, category: 'Politics' },
    { name: '#EdinburghFringe', type: 'hashtag', volume: 155000, category: 'Arts' },
  ],
  japan: [
    { name: '#アニメ大賞2026', type: 'hashtag', volume: 810000, category: 'Anime' },
    { name: 'Nintendo Switch 2', type: 'topic', volume: 690000, category: 'Gaming' },
    { name: '#東京ゲームショウ', type: 'hashtag', volume: 510000, category: 'Gaming' },
    { name: 'Studio Ghibli New Film', type: 'topic', volume: 440000, category: 'Cinema' },
    { name: '#プロ野球速報', type: 'hashtag', volume: 380000, category: 'Baseball' },
    { name: 'Shinkansen Maglev', type: 'topic', volume: 320000, category: 'Transit' },
    { name: '#JPOPTop10', type: 'hashtag', volume: 280000, category: 'Music' },
    { name: 'Sony PlayStation 6 Rumors', type: 'topic', volume: 250000, category: 'Tech' },
    { name: '#桜開花宣言', type: 'hashtag', volume: 210000, category: 'Nature' },
    { name: 'Akihabara Tech Expo', type: 'topic', volume: 180000, category: 'Tech' },
  ],
};

// Generic fillers to complete full 50 items list
const GENERAL_TREND_FILLERS = [
  '#Web3Revolution', 'Microservices 2.0', '#MachineLearningOps', 'Autonomous Drones',
  '#GreenEnergySolutions', 'Next.js 16', '#TypeScriptUpdates', 'Smart Cities Summit',
  '#FintechDisruption', 'BioTech Breakthrough', '#RoboticsFuture', 'Cloud Native Day',
  '#UIUXDesigners', 'Semiconductor Shortage', '#FullStackDev', '5G Advanced Rollout',
  '#ProductManagement', 'Generative Media', '#DevOpsLife', 'Battery Chemistry Advances',
  '#CleanCode', 'Edge Computing Nodes', '#DataScienceToday', 'Space Exploration Summit',
  '#OpenSourceCommunity', 'Cyber Threat Intel', '#AgileLeadership', 'Augmented Reality Glass',
  '#RemoteWorkTrends', 'Synthetic Biology', '#TechPodcast', 'Digital Identity Standards'
];

export function generateDemoTrends(locationSlug: string, count: number = 50): RawGetXApiTrend[] {
  const baseTopics = LOCATION_DEMO_TOPICS[locationSlug] || LOCATION_DEMO_TOPICS.worldwide;
  const result: RawGetXApiTrend[] = [];

  baseTopics.forEach((item, index) => {
    const isHashtag = item.name.startsWith('#');
    const query = isHashtag ? item.name : encodeURIComponent(item.name);
    
    // Calculate realistic variance
    const deltaOptions = [35, 24, 18, 12, 7, 3, 0, -2, -6, -11, -19];
    const change = deltaOptions[index % deltaOptions.length];
    const prevRank = Math.max(1, index + 1 + change);

    result.push({
      name: item.name,
      query: item.name,
      tweet_volume: item.volume,
      rank: index + 1,
      change,
      previous_rank: prevRank,
      promoted: index === 6, // 1 promoted sample item
      first_seen: `${(index * 4) + 6} min ago`,
      category: item.category,
      url: isHashtag
        ? `https://x.com/hashtag/${encodeURIComponent(item.name.replace(/^#/, ''))}`
        : `https://x.com/search?q=${query}`,
    });
  });

  // Fill up to requested count with additional items
  let fillIdx = 0;
  while (result.length < count) {
    const fillerName = GENERAL_TREND_FILLERS[fillIdx % GENERAL_TREND_FILLERS.length];
    const uniqueName = `${fillerName} ${result.length > 30 ? '#' + (result.length - 20) : ''}`.trim();
    const rank = result.length + 1;
    const isHash = uniqueName.startsWith('#');
    const volume = Math.max(12000, 180000 - (rank * 3200));

    result.push({
      name: uniqueName,
      query: uniqueName,
      tweet_volume: volume,
      rank,
      change: (rank % 5) - 2,
      previous_rank: rank + ((rank % 5) - 2),
      promoted: false,
      first_seen: `${(rank * 3) + 2} min ago`,
      category: 'General',
      url: isHash
        ? `https://x.com/hashtag/${encodeURIComponent(uniqueName.replace(/^#/, ''))}`
        : `https://x.com/search?q=${encodeURIComponent(uniqueName)}`,
    });
    fillIdx++;
  }

  return result.slice(0, count);
}

/**
 * Generate synthetic historical data points for a trend
 */
export function generateDemoTrendHistory(trendName: string, currentRank: number) {
  const times = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
  
  // Create realistic trajectory based on current rank
  return times.map((time, idx) => {
    // Start higher (worse rank, e.g. 45) and improve to current rank, or fluctuate
    const progress = idx / (times.length - 1);
    const startRank = Math.min(50, currentRank + Math.floor((1 - progress) * 35));
    const noise = Math.floor(Math.sin(idx * 1.5) * 3);
    const calculatedRank = Math.max(1, Math.min(50, Math.round(startRank + noise)));

    return {
      timestamp: new Date(Date.now() - (times.length - 1 - idx) * 30 * 60 * 1000).toISOString(),
      timeLabel: time,
      rank: idx === times.length - 1 ? currentRank : calculatedRank,
      tweetVolume: Math.round(150000 * (0.4 + progress * 0.6)),
    };
  });
}
