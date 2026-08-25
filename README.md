# TrendScope — X/Twitter Trends & Hashtag Intelligence Dashboard

<div align="center">
  <img src="public/trendscope-banner.svg" alt="TrendScope Animated Banner" width="100%" />
</div>

<p align="center">
  <strong>Surveil, quantify, and compare viral momentum across X (Twitter) in real-time across 195+ countries and worldwide territories with dual isolated intelligence workspaces.</strong>
</p>

<p align="center">
  <a href="https://vercel.com/new"><img src="https://vercel.com/button" alt="Deploy with Vercel" /></a>
  <img src="https://img.shields.io/badge/Next.js-15.0_App_Router-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Portals-Isolated_Dual_Codes-6366F1?style=flat-square" alt="Isolated Portals" />
  <img src="https://img.shields.io/badge/Real--Time_Proxy-GetXAPI-22C55E?style=flat-square" alt="Real-time API" />
</p>

---

## ⚡ Animated Architecture & Telemetry Pipeline

<div align="center">
  <img src="public/workflow-architecture.svg" alt="TrendScope Real-Time Workflow Architecture" width="100%" />
</div>

---

## 🔐 Dual Isolated Workspaces & Access Codes

TrendScope features strict portal separation between analytical power-tools and rapid content creator utilities:

| Portal | Access PIN | Scope & Purpose |
|---|:---:|---|
| **⚡ Advance Intelligence Panel** | `7492` | Full-scale 50-trend command center, interactive trajectory line charts, momentum velocity indexes, 2-country diff comparisons, 24h shift histories, and auto-polling engine. |
| **🏷️ Top 10 Hashtags Finder** | `7491` | Lightweight, ultra-fast country search dashboard with instant top 10 hashtag extraction and 1-click clipboard copying (`#tag1 #tag2 ...`). |

> **Security Note**: Both portals operate under isolated session keys with instant **Lock & Logout** controls across the top navigation and sidebar, preventing unauthorized cross-panel traversal.

---

## 🎯 Key Functional Capabilities

```
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Module                  │ Highlights                                             │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ 🔒 Portal Gate Auth     │ Dual access codes (7492 Advance / 7491 Hashtags)       │
│ 🌐 Global Surveillance  │ 195+ ISO country selection with worldwide aggregates   │
│ 🏷️ 3-Way Classification │ Live segmenting: # Hashtags, Topics, and Phrases       │
│ 🚀 Velocity Radar       │ Real-time momentum scoring (0-10) with Exploding tags  │
│ 📈 Trajectory Charts    │ Recharts volume breakdown, velocity & rank progression │
│ ⚔️ Geo Comparison Diff  │ Side-by-side overlap, shared hashtags, and volume gaps │
│ 📋 1-Click Copy Engine  │ Rapid clipboard exporter for social media management   │
│ 🛡️ Secure Edge Proxy    │ Zero-client API secrets with custom GetXAPI key support│
│ 🔄 Auto-Polling Engine  │ Dynamic intervals (15s, 30s, 60s, 5m) with countdown   │
│ 🧪 Zero-Config Demo     │ Instant high-fidelity synthetic feeds without API keys │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Workflow Architecture

```
[ User Enters Access Code in Portal Gate: 7492 or 7491 ]
                         │
                         ▼
        [ Authenticated Portal Session Established ]
         ├── Advance Panel (7492) ──► Full 50-Trend Analytics
         └── Hashtags Finder (7491) ─► Top 10 Hashtag Quick-Copier
                         │
                         ▼ (Selects ISO Territory & Custom Polling Interval)
       [ Secure Server API Proxy: /api/trends?country=... ]
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
  [ Has Custom Key? ]           [ No Key Configured ]
          │                             │
          ▼                             ▼
[ GetXAPI Edge Endpoint ]     [ Synthetic Geo Engine ]
          │                             │
          └──────────────┬──────────────┘
                         ▼
       [ Normalizer & Velocity Telemetry Engine ]
         ├─ Detect type: Hashtag (#), Phrase, Topic
         ├─ Compute Velocity Index (0.0 – 10.0)
         ├─ Track Ranking Trajectory Shifts
         └─ Classify Status: EXPLODING 🔥 | RISING 📈 | STABLE ➖
                         │
                         ▼
     [ Recharts Trajectory / Velocity Radar / Data Tables ]
```

---

## 🚀 One-Click Deployment to Vercel

### Step 1: Deploy with Vercel Button
Click the **Deploy with Vercel** button above or connect your GitHub repository directly in the [Vercel Dashboard](https://vercel.com/new).

### Step 2: Configure Environment Variables
In your Vercel Project Settings under **Settings ➔ Environment Variables**:

| Variable | Requirement | Default | Description |
|---|---|---|---|
| `GETXAPI_API_KEY` | Optional | `""` (Demo Mode) | Your API Key from [GetXAPI](https://getxapi.com). If left empty, TrendScope defaults to realistic live simulation mode. |

### Step 3: Build & Start Verification
TrendScope will automatically build using:
* **Framework Preset**: Next.js
* **Build Command**: `npm run build`
* **Output Directory**: `.next`

---

## 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/trendscope.git
cd trendscope

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

* Enter **`7492`** to unlock the **Advance Intelligence Panel**.
* Enter **`7491`** to unlock the **Top 10 Hashtags Finder** (`/hashtags`).

---

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── status/route.ts      # Real-time API telemetry & latency check
│   │   └── trends/route.ts      # Server-side proxy with fallback engine
│   ├── compare/page.tsx         # Cross-territory side-by-side analysis
│   ├── countries/page.tsx       # 195+ territory directory and quick-launch
│   ├── emerging/page.tsx        # High-velocity and exploding topics radar
│   ├── hashtags/page.tsx        # Top 10 Hashtags Finder with 1-click clipboard
│   ├── history/page.tsx         # 24h ranking shift and trajectory tracker
│   ├── settings/page.tsx        # Client key injection & quota telemetry
│   ├── trends/[country]/        # Dynamic territory routes & SEO generators
│   ├── icon.svg                 # SVG Brand Favicon & Web App Manifest Icon
│   ├── layout.tsx               # Root layout & theme wrapper
│   └── page.tsx                 # Primary worldwide command center
├── components/
│   ├── ApiStatus.tsx            # Live API latency and connection indicator
│   ├── ApiUsageGraph.tsx        # Telemetry usage analytics chart
│   ├── CountrySelector.tsx      # Fast search & ISO territory switcher
│   ├── DashboardLayout.tsx      # Master dashboard shell with code 7492 gate
│   ├── Header.tsx               # Top command bar with live indicators & logout
│   ├── PortalGate.tsx           # Isolated PIN verification gate (7492 / 7491)
│   ├── RefreshControl.tsx       # Auto-polling selector with countdown
│   ├── Sidebar.tsx              # Responsive navigation & Lock/Logout drawer
│   ├── TrendCard.tsx            # Mobile & grid view card component
│   ├── TrendChart.tsx           # Recharts volume, trajectory & velocity visualizer
│   ├── TrendScopeLogo.tsx       # Brand vector icon component
│   └── TrendTable.tsx           # Main table with 3-way type & velocity filters
├── lib/
│   ├── auth-session.ts          # Portal session store & authentication tokens
│   ├── countries.ts             # 195+ ISO territory registry & metadata
│   ├── demo-data.ts             # High-fidelity realistic feed simulator
│   ├── getxapi.ts               # GetXAPI client with proxy abstraction
│   ├── normalizer.ts            # Data sanitizer & momentum velocity calculator
│   └── trend-utils.ts           # Type detectors, URL builders, formatters
└── public/
    ├── icon.svg                 # Brand icon vector
    ├── trendscope-banner.svg    # Animated SVG banner with workspace badges
    └── workflow-architecture.svg# Animated SVG architecture diagram
```

---

## 🔒 Security & Privacy

* **Strict Server-Side Proxy**: All external requests to `getxapi.com` are initiated from Next.js server routes. Your API keys are never exposed in browser network inspection.
* **Workspace Isolation**: Access to the Advance Panel and Hashtags Portal requires separate PIN validation. Sessions are stored in scoped storage tokens with instant revocation upon Logout.
* **Client-Side Key Option**: Users can optionally supply their own personal key in `/settings`, which is sent exclusively via encrypted transit headers to the local Next.js proxy route and never stored permanently on the server.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
