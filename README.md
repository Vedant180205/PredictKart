<div align="center">

![PredictKart Banner](./assets/banner.png)

<br/>

**PredictKart** (branded as *prerdict.cart*) is a self-hosted AI-driven shopping intelligence and price-tracking dashboard. It scrapes product details from major e-commerce platforms (Amazon and Flipkart), cross-compares prices in real-time, schedules background price-drop alerts, and uses **Llama 3.1 8B on Groq** to predict deal quality scores and advise users with a conversational shopping assistant.

<br/>

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](#)
[![Python Version](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![FastAPI Version](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](#)
[![Next.js Version](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js&logoColor=white)](#)
[![Tailwind Version](https://img.shields.io/badge/Tailwind--CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](#)
[![LLM Platform](https://img.shields.io/badge/AI--Engine-Groq--Llama3.1-orange?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)

</div>

---

## Overview

In today's e-commerce landscape, prices are extremely dynamic. Platforms manipulate prices using complex pricing algorithms, inflating Recommended Retail Prices (MRPs) to show fake discounts while flashing artificial countdown timers to pressure buyers. 

**PredictKart takes a different approach.** Instead of manual bookmarking or checking multiple platforms, users input a product link. PredictKart intercepts the request, scrapes data via ScraperAPI (bypassing bot blockers), and caches the parsed details. It then triggers parallel search crawls across competitor platforms and Google Shopping (SerpAPI) to find alternative offers. Finally, it parses the 30-day price history and upcoming sales schedules through a 8B Llama 3.1 model to calculate a **Deal Score** and provide an interactive AI shopping assistant.

**Engineering Philosophy:**
- **Reciprocal Comparison Engine** — Paste an Amazon link, and the system synchronously searches Flipkart. Paste a Flipkart link, and it scrapes Amazon. You always see both sides of the price war.
- **Aggressive Caching & Smart TTL** — Product parsing is heavy. Scraped items are cached in SQLite/PostgreSQL; subsequent requests under 24 hours resolve instantly without calling external scrapers.
- **Structured Prediction Format** — LLM queries return strict JSON objects to prevent prompt parsing errors, ensuring reliable calculation of deal confidence.
- **Asynchronous Task Architecture** — Price checking and scraping are offloaded asynchronously. An active cron-like background job runs every 6 hours to check if user targets have been met.

---

## Key Features

| Feature | Description | Status |
|---|---|---|
| **Reciprocal Cross-Compare** | Real-time competitor platform lookup (Amazon ⇆ Flipkart) | ✅ Live |
| **Proxy-Rotated Scraping** | Bypasses anti-bot guards using ScraperAPI and custom BeautifulSoup selectors | ✅ Live |
| **AI Shopping Advisor** | Conversational Groq (Llama 3.1 8B) assistant contextualized with product specs and competitor pricing | ✅ Live |
| **AI Deal Oracle** | Calculates a 0-100 buying score and reasoning based on 30-day history and upcoming sales | ✅ Live |
| **Upcoming Sales Database** | Tracks future shopping events (Great Indian Festival, Prime Day) to advise on waiting | ✅ Live |
| **Background Price Checker** | Automated background job running every 6 hours via AsyncIOScheduler to check target thresholds | ✅ Live |
| **Interactive 3D Spline** | Features an interactive, responsive 3D Spline Robot built into the AI chat interface | ✅ Live |
| **Bento Activity Dashboard** | Modern bento grid layout visualizing pending price drops, high-confidence deals, and tracker history | ✅ Live |
| **JWT Authentication** | Secure signup, login, and authorization middleware utilizing Passlib and bcrypt | ✅ Live |
| **Celery Tasks Integration** | Offloading background checks to distributed Celery workers and Redis broker | 🔜 Roadmap |
| **Push Notifications** | Direct alerting via Telegram, WhatsApp, and Web Push instead of console mock logging | 🔜 Roadmap |

---

## System Architecture

PredictKart consists of a Next.js v16 dashboard frontend, a FastAPI async backend, and an external API layer. Database records (users, products, price histories, alerts, sales) are managed via SQLAlchemy. Groq's Llama 3.1 API serves as the reasoning engine.

```mermaid
graph LR
    subgraph Client["🖥 Client"]
        UI["Next.js 16\nTailwind v4 + Framer Motion"]
    end

    subgraph API["⚡ FastAPI Backend"]
        AUTH["Auth Router\nSignup / Login"]
        COMP["/api/compare\nScraperAPI + Cache"]
        CROSS["/api/cross-compare\nAmazon & Flipkart Search"]
        AI_COMP["/api/ai-assistant\nGroq Advisor"]
        DEAL["/api/deal-report\nDeal Predictor"]
        TRACK["/api/track\nPrice Tracker"]
    end

    subgraph AI["🤖 AI Engine"]
        ADVISOR["ai_assistant.py\nShopping Advice"]
        ORACLE["deal_predictor.py\nGroq Deal Score"]
        GROQ["Groq API\nLlama 3.1 8B Instant"]
    end

    subgraph Ext["🌐 External APIs"]
        SAPI["ScraperAPI\nProxy Rotation"]
        SERP["SerpAPI\nGoogle Shopping"]
    end

    DB[("SQLite / PostgreSQL\nSQLAlchemy Async")]

    UI -->|"HTTP + Bearer"| API
    COMP -->|"Proxied Fetch"| SAPI
    CROSS -->|"Competitor Crawl"| SAPI
    CROSS -->|"Web Search"| SERP
    DEAL -->|"History + Sales"| ORACLE
    AI_COMP -->|"Product Context"| ADVISOR
    ADVISOR -->|"Structured Prompts"| GROQ
    ORACLE -->|"JSON Report"| GROQ
    API <-->|"SQLAlchemy ORM"| DB
```

---

## User Flow

From pasting a URL to receiving price drop alerts:

```mermaid
flowchart TD
    A["👤 User"] -->|"Search / Compare URL"| B["POST /api/compare"]
    B --> C{"Product Cached\n< 24 Hours?"}
    C -->|"✅ Yes"| D["Return Cached Product"]
    C -->|"❌ No"| E["Scrape Product via ScraperAPI"]
    E --> F["Extract Price, Title, Specs, Rating"]
    F --> G["Upsert to Products DB & Save PriceHistory"]
    D --> H["POST /api/cross-compare"]
    G --> H
    H -->|"Parallel Search"| I["Scrape Competitor Site"]
    H -->|"Web Crawl"| J["SerpAPI Google Shopping"]
    I & J --> K["Return Competitor Price Offers"]
    K --> L["Ask AI Assistant / Generate Deal Report"]
    L --> M["Set Price Alert Tracker"]
    M --> N["Background Scheduler Checks Price (6h)"]
    N --> O{"Price <= Target?"}
    O -->|"Yes"| P["Trigger Alert & Notify User"]
    O -->|"No"| Q["Keep Tracking"]
```

---

## AI Deal Prediction Pipeline

The Deal Report generation evaluates historical and seasonal context synchronously to predict price actions:

```mermaid
flowchart LR
    A["POST /api/deal-report"] --> B["Fetch Product details"]
    B --> C["Fetch 30-Day Price History"]
    C --> D["Calculate lowest, highest, average & % drop"]
    D --> E["Query database for active & relevant sales"]
    E --> F["Select sales by category or 'all' tag"]
    F --> G["Inject stats + sales into Groq LLM prompt"]
    G --> H["Llama 3.1 returns JSON (Score, Rec, Reasoning)"]
    H --> I["Return final deal report to dashboard"]
```

---

## Background Alert Scheduler

Active price alerts run off the main request thread every 6 hours via an asynchronous job runner:

```mermaid
flowchart TD
    A["Scheduler Triggers"] --> B["Select active user_tracking records"]
    B --> C["Loop through tracking alerts"]
    C --> D["Fetch corresponding product URL"]
    D --> E["Scrape live price via ScraperAPI"]
    E --> F{"Live Price <= Target Price?"}
    F -->|"✅ Yes"| G["Log Alert to console & mark tracking inactive"]
    F -->|"❌ No"| H["Keep tracking record active"]
    G & H --> I["Check next tracking record"]
```

---

## Tech Stack

<div align="center">

<table>
  <tr>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=py" height="45" alt="Python"/><br/>
      <sub><b>Python 3.12</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=fastapi" height="45" alt="FastAPI"/><br/>
      <sub><b>FastAPI</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=sqlite" height="45" alt="SQLite"/><br/>
      <sub><b>SQLite</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=postgres" height="45" alt="PostgreSQL"/><br/>
      <sub><b>Postgres</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=docker" height="45" alt="Docker"/><br/>
      <sub><b>Docker</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=nextjs" height="45" alt="Next.js"/><br/>
      <sub><b>Next.js 16</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=react" height="45" alt="React"/><br/>
      <sub><b>React 19</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=ts" height="45" alt="TypeScript"/><br/>
      <sub><b>TypeScript</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=tailwind" height="45" alt="Tailwind CSS"/><br/>
      <sub><b>Tailwind v4</b></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=vercel" height="45" alt="Vercel"/><br/>
      <sub><b>Vercel</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=git" height="45" alt="Git"/><br/>
      <sub><b>Git</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=redis" height="45" alt="Redis"/><br/>
      <sub><b>Redis</b><br/><i>roadmap</i></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=linux" height="45" alt="Linux"/><br/>
      <sub><b>Linux</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=postman" height="45" alt="Postman"/><br/>
      <sub><b>Postman</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=github" height="45" alt="GitHub"/><br/>
      <sub><b>GitHub Repo</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=yarn" height="45" alt="Yarn"/><br/>
      <sub><b>Yarn</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=nodejs" height="45" alt="Node.js"/><br/>
      <sub><b>Node.js 20</b></sub>
    </td>
    <td align="center" width="100">
      <img src="https://skillicons.dev/icons?i=npm" height="45" alt="NPM"/><br/>
      <sub><b>NPM</b></sub>
    </td>
  </tr>
</table>

<br/>

<!-- Secondary tooling badges -->
<img src="https://img.shields.io/badge/Groq%20%2F%20LLaMA%203.1%208B-FF4500?style=flat-square&logo=meta&logoColor=white" />
<img src="https://img.shields.io/badge/SQLAlchemy%202.0-D71F00?style=flat-square&logoColor=white" />
<img src="https://img.shields.io/badge/Pydantic%20v2-E92063?style=flat-square&logo=pydantic&logoColor=white" />
<img src="https://img.shields.io/badge/ScraperAPI-00B2FF?style=flat-square" />
<img src="https://img.shields.io/badge/SerpAPI-FF8C00?style=flat-square" />
<img src="https://img.shields.io/badge/Spline%203D-FF1493?style=flat-square&logo=spline&logoColor=white" />
<img src="https://img.shields.io/badge/Recharts-22C55E?style=flat-square" />
<img src="https://img.shields.io/badge/Framer%20Motion-00C5FF?style=flat-square&logo=framer&logoColor=white" />
<img src="https://img.shields.io/badge/APScheduler-4F46E5?style=flat-square" />
<img src="https://img.shields.io/badge/BeautifulSoup4-34D399?style=flat-square" />
<img src="https://img.shields.io/badge/Playwright-2E8B57?style=flat-square&logo=playwright&logoColor=white" />

<br/><br/>
<sub>Italicized entries represent roadmap targets — the async SQLAlchemy layer is built to integrate Postgres and Redis swaps.</sub>

</div>

---

## Getting Started

### Prerequisites
- Python **3.12+**
- Node.js **20+** (with npm or yarn)
- A **ScraperAPI Key** — register at [scraperapi.com](https://www.scraperapi.com) (free trial available)
- A **Groq API Key** — generate at [console.groq.com](https://console.groq.com)
- *(Optional)* A **SerpAPI Key** — obtain at [serpapi.com](https://serpapi.com)

### 1. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=sqlite+aiosqlite:///./predictkart.db
# Alternatively, PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/predictkart

GROQ_API_KEY=gsk_your_groq_api_key
SCRAPERAPI_KEY=your_scraper_api_key
SERPAPI_KEY=your_serp_api_key
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. Configure & Seed the Database

Initialize your tables and seed initial sales events:

```bash
# From the root directory:
# Create all database tables
python scripts/create_tables.py

# Populate upcoming sales events in database (Republic Day, Prime Day, Great Indian Festival, BBD)
cd backend
python -m scripts.populate_sales
```

### 3. Launch Backend Server

```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
# API documentation available at http://localhost:8000/docs
```

### 4. Launch Frontend Server

```bash
cd ../frontend
npm install
npm run dev
# Dashboard available at http://localhost:3000
```

---

## Troubleshooting

<details>
<summary><strong>ScraperAPI 401 or Missing Key errors</strong></summary>

Verify that your `SCRAPERAPI_KEY` in the backend `.env` is correct. ScraperAPI blocks requests if keys are suspended or out of credits.
</details>

<details>
<summary><strong>Groq API Rate Limit or Quota issues</strong></summary>

The AI engine uses `llama-3.1-8b-instant`. If requests return fallback values (e.g. score: 50, "Wait"), check your API usage on the Groq Console. Rate-limited requests are handled gracefully by returning structured fallbacks instead of crashing.
</details>

<details>
<summary><strong>CORS issues connecting frontend to backend</strong></summary>

Ensure the backend server runs on port `8000` and the frontend runs on port `3000`. If you host on different origins, adjust the `origins` array in `backend/main.py`.
</details>

<details>
<summary><strong>Sqlite3 thread lock or asyncpg connection error</strong></summary>

`DATABASE_URL` is parsed by `app/core/database.py` and dynamically resolves Supabase/PostgreSQL connections into async drivers. For SQLite, ensure you use the `sqlite+aiosqlite://` prefix for proper async event loops.
</details>

---

## API Reference

PredictKart exposes a clean, documented Swagger interface at `http://localhost:8000/docs`.

### Authentication Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/signup` | Create a new user account |
| `POST` | `/login` | Authenticate user credentials and return user profile |

### Price comparison & Search Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/compare` | Fetch detailed product specs, cache details, and return parsed data |
| `POST` | `/api/cross-compare` | Real-time crawl of competitor price listings & Google Shopping links |
| `POST` | `/api/google-shopping-search` | Search for products across web shopping pages using SerpAPI |
| `POST` | `/ai/search` | Search assistant combining tools (time checks, url builders, shopping searches) |
| `POST` | `/api/classify-product` | Categorize product names into categories (electronics, clothing, etc.) using Groq |

### Tracking & Alerts Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/track` | Track a product by configuring a target threshold |
| `GET` | `/api/user-tracking` | Fetch list of active price trackers for current user |
| `GET` | `/api/recent-tracking` | Fetch top 4 tracked items with calculated mock drop percentages |
| `POST` | `/api/update-track/{tracking_id}` | Manually trigger a ScraperAPI live check to verify target price |
| `GET` | `/api/user-stats` | Fetch general tracking counts, total mock saved currency, and alert counts |
| `POST` | `/api/alerts` | Set a price drop tracker for a user |
| `GET` | `/api/alerts/{user_id}` | Retrieve all active alerts/trackers for a specific user ID |

### AI intelligence Endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ai-assistant` | Conversational Shopping advisor with product specification context |
| `POST` | `/api/deal-report` | Evaluates 30-day history statistics and upcoming sales, returning a deal score |
| `GET` | `/api/product/{product_id}/price-history` | Retrieve full chronological price history for chart rendering |

### Deal Report Output Example
`POST /api/deal-report` returns:
```json
{
  "score": 85,
  "recommendation": "Buy now",
  "reasoning": "The current price of ₹12,999 is within 2% of the lowest recorded price (₹12,800) over the last 30 days. No major electronics sales are scheduled on Flipkart or Amazon in the next 15 days, making this an optimal buy point.",
  "current_price": 12999.00,
  "lowest_price": 12800.00,
  "average_price": 13420.50,
  "upcoming_sales": []
}
```

---

## Engineering Concepts

<details>
<summary><strong>24-Hour Product Cache TTL</strong></summary>

Scraping Amazon and Flipkart dynamically via proxy pools takes 3-10 seconds and consumes API credits. To optimize, `/api/compare` checks the database first. If a matching URL is found and `last_checked` is less than 24 hours old, it returns the cached data. If older, it fetches fresh HTML, parses elements, updates the product schema, and appends a `PriceHistory` entry.
</details>

<details>
<summary><strong>Groq JSON Object Enforcement</strong></summary>

Both the AI assistant and the Deal Predictor utilize JSON mode. By adding `response_format={"type": "json_object"}` to the client call, Groq is forced to return syntactically valid JSON. This prevents raw conversational text (e.g. *"Here is your report:"*) from corrupting the parsing flow.
</details>

<details>
<summary><strong>Upcoming Sales Category Matching</strong></summary>

When predicting price trends, the Deal Predictor parses the product title for keywords (e.g. *phone, laptop, tv* for electronics; *shirt, dress, shoe* for fashion). It queries the database for sales matching that category or tagged `all`. If a sale starts soon (e.g., *Prime Day*), and has a confidence tier of `high` or `medium`, the AI recommends waiting.
</details>

<details>
<summary><strong>Asynchronous Database Operations</strong></summary>

FastAPI calls use SQLAlchemy's `AsyncSession` to communicate with SQLite or PostgreSQL. This keeps the single-threaded event loop from locking up during database queries, ensuring that user authentication or scraper requests run in parallel.
</details>

---

## Scalability & Roadmap

PredictKart uses a lightweight asynchronous architecture suitable for small-scale deployments:

| Phase | Architecture | Handles |
|---|---|---|
| **Phase 1 (Current)** | FastAPI ASGI · AsyncIOScheduler · SQLite · AsyncSession | ~100 active trackers |
| **Phase 2 (Scalable)** | Celery Worker pool · Redis broker · PostgreSQL · Docker-compose | 1,000+ active trackers |
| **Phase 3 (Enterprise)**| Kubernetes deployments · Prometheus metrics · Email/SMS microservices | Multi-tenant orgs |

### Planned Integrations

| Integration | Difficulty | Impact |
|---|---|---|
| **Telegram / Discord Alerts** | Low | Rich embed messages sent straight to channels on price drop |
| **Playwright Scraping** | Medium | Bypasses Javascript-heavy single page shops (Myntra, Ajio) |
| **Supabase DB Sync** | Low | Drop-in Postgres swap using asyncpg driver |

---

## Future Scope

<details>
<summary><strong>AI Agent Checkout Integration</strong></summary>

An experimental feature enabling browser agents (e.g. Playwright / Selenium) to automatically add products to cart, apply coupon codes scraped from coupon boards, and notify users when the cart is ready for checkout.
</details>

<details>
<summary><strong>Collaborative Shopping Pools</strong></summary>

Allow groups of users to pool together to monitor wholesale prices, bulk deal thresholds, or shipping limits, utilizing shared tracking lists.
</details>

<details>
<summary><strong>Dynamic Graph Price Predictions</strong></summary>

Integrating machine learning regression models on price history datasets to forecast price curves and seasonal adjustments rather than relying solely on LLM logical inferences.
</details>

---

## Repository Structure

```
PredictKart/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py     # SQLAlchemy async database setup
│   │   │   └── security.py     # Password hashing with passlib/bcrypt
│   │   ├── models/
│   │   │   └── models.py       # ORM models (User, Product, PriceHistory, UserTracking, Alert, AICache, UpcomingSale)
│   │   ├── schemas/
│   │   │   └── user.py         # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── ai_assistant.py # Groq shopping advisor agent
│   │   │   ├── amazon_search.py # Amazon search helper via scraper
│   │   │   ├── deal_predictor.py # AI Deal report generator
│   │   │   ├── flipkart_search.py # Flipkart scraper
│   │   │   ├── google_shopping.py # Google shopping scraper
│   │   │   ├── scraper.py      # Core scraping logic
│   │   │   ├── scraperapi.py   # ScraperAPI product parser
│   │   │   ├── serpapi.py      # SerpAPI integration
│   │   │   └── site_search.py  # E-commerce platform search dispatcher
│   │   └── tasks/
│   │   ├── main.py             # FastAPI entrypoint, endpoints, and background scheduler
│   │   ├── migrate_tracking.py # Migration script for tracking table
│   │   └── requirements.txt    # Python dependencies
│   └── scripts/
│       ├── migrate_db.py       # Database schema migrations
│       └── populate_sales.py   # Sales data seeder
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── ai-assistant/   # Conversational shopping advisor
│   │   │   ├── deal-predictor/ # AI Price oracle report generator
│   │   │   ├── gift-cards/     # Gift cards section (mockup)
│   │   │   ├── grocery/        # Grocery items section (mockup)
│   │   │   ├── price-alerts/   # Alert management interface
│   │   │   ├── price-comparison/ # Real-time price hunter
│   │   │   ├── ride-compare/   # Ride fare comparison (mockup)
│   │   │   ├── spend-lens/     # Expense charts and insights (mockup)
│   │   │   ├── layout.tsx      # Sidebar and header navigation
│   │   │   ├── page.tsx        # Dashboard Activity feed and bento metrics
│   │   │   └── SearchContext.tsx # Context for search state sharing
│   │   ├── globals.css         # Styling directives and custom Tailwind variables
│   │   ├── layout.tsx          # Root next.js layout
│   │   └── page.tsx            # Landing page with Framer Motion features
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── AuthModal.tsx       # Signup & login overlay dialog
│   │   ├── categories-section.tsx # Homepage category grid
│   │   ├── features-section.tsx   # Homepage bento grids
│   │   ├── footer.tsx          # Footer widget
│   │   ├── hero-section.tsx    # Animated landing banner
│   │   ├── navigation.tsx      # Landing navbar
│   │   └── theme-provider.tsx  # dark/light mode provider
│   ├── hooks/                  # Custom react hooks
│   ├── styles/                 # Theme styles
│   ├── package.json            # NPM configuration & dependencies
│   └── tsconfig.json           # TypeScript configuration
│
├── scripts/
│   ├── create_tables.py        # Table generator for db initialization
│   ├── seed_data.py            # Initial dataset seeder
│   └── add_image_col.py        # Database migration utility
│
├── assets/
│   └── banner.png              # AI Generated banner
└── README.md
```

---

## Contributing

Contributions are always welcome. Before creating a pull request:

```bash
# Backend Quality Check
cd backend
ruff check .  # Or flake8

# Frontend Quality Check
cd frontend
npm run lint
npm run build
```

Commit Message Guideline: `type(scope): description` (e.g. `feat(ai): add Llama-3.1 temperature controls for shopping advisor`).

---

<div align="center">

Built with FastAPI · Next.js · Groq AI · ScraperAPI · SerpAPI

</div>
