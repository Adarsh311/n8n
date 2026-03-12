# Pinterest Affiliate Marketing Automation System

A fully automated Pinterest affiliate marketing pipeline built on **n8n**, designed to discover trending products, generate affiliate links, create AI-powered content and images, and publish pins automatically.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PINTEREST AFFILIATE MARKETING PIPELINE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐   ┌───────────┐   ┌─────────┐   ┌──────────┐   ┌─────────┐ │
│  │ MODULE 1 │──▶│ MODULE 2  │──▶│MODULE 3 │──▶│ MODULE 4 │──▶│MODULE 5 │ │
│  │  Daily   │   │ Trending  │   │   AI    │   │ Affiliate│   │  Pin    │ │
│  │ Trigger  │   │ Discovery │   │ Filter  │   │   Link   │   │ Content │ │
│  └──────────┘   └───────────┘   └─────────┘   └──────────┘   └─────────┘ │
│                                                                      │      │
│  ┌──────────┐   ┌───────────┐   ┌─────────┐   ┌──────────┐   ┌─────┴───┐ │
│  │MODULE 11 │   │ MODULE 10 │◀──│MODULE 9 │◀──│ MODULE 8 │◀──│MODULE 6 │ │
│  │Analytics │   │  Storage  │   │ Publish │   │ Assembly │   │ Image   │ │
│  │ Report   │   │ & Track   │   │  Pins   │   │  Pin     │   │ Prompts │ │
│  └──────────┘   └───────────┘   └─────────┘   └──────────┘   └────┬────┘ │
│                                                                     │      │
│                                                               ┌─────┴───┐  │
│                                                               │MODULE 7 │  │
│                                                               │  SDXL   │  │
│                                                               │ Image   │  │
│                                                               └─────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Automation Platform | n8n (v2.8.3+) |
| Language Model | Kimi K2.5 (via Moonshot API) |
| Image Generation | Stable Diffusion XL (via Stability AI) |
| Affiliate Platform | EarnKaro |
| Publishing Platform | Pinterest (API v5) |
| Storage (Optional) | Notion / Airtable / PostgreSQL |

---

## Quick Start

### 1. Prerequisites

- Node.js >= 18
- n8n instance (self-hosted or cloud)
- API keys for: Pinterest, EarnKaro, Stability AI, Kimi K2.5

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Adarsh311/n8n.git
cd n8n

# Install dependencies
npm install

# Install custom nodes (optional - for dedicated node support)
cd custom-nodes/n8n-nodes-pinterest && npm install && npm run build && cd ../..
cd custom-nodes/n8n-nodes-earnkaro && npm install && npm run build && cd ../..
cd custom-nodes/n8n-nodes-stability-ai && npm install && npm run build && cd ../..

# Start n8n
npm start
```

### 3. Environment Variables

Set the following environment variables before starting n8n:

```bash
# Pinterest OAuth2 (set up via n8n credentials UI)
PINTEREST_BOARD_ID=your-default-board-id

# EarnKaro
EARNKARO_API_KEY=your-earnkaro-api-key
EARNKARO_API_URL=https://ekaro.in/api/v1

# Stability AI (Stable Diffusion XL)
STABILITY_AI_API_KEY=your-stability-ai-api-key
SDXL_MODEL=stable-diffusion-xl-1024-v1-0

# Kimi K2.5 (Moonshot AI)
KIMI_API_KEY=your-kimi-api-key

# Analytics & Storage
STORAGE_WEBHOOK_URL=your-notion-or-airtable-webhook-url
STORAGE_API_URL=your-storage-api-url
STORAGE_API_KEY=your-storage-api-key

# Notifications
NOTIFICATION_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

### 4. Import the Workflow

1. Open your n8n instance
2. Go to **Workflows** > **Import from File**
3. Select `workflows/pinterest-affiliate-marketing.json`
4. Configure credentials for each node
5. Activate the workflow

---

## Module Reference

### MODULE 1 — Daily Trigger

**Node:** Schedule Trigger
**Schedule:** Every day at 9:00 AM
**Purpose:** Initiates the entire pipeline on a daily basis

### MODULE 2 — Trending Product Discovery

**Nodes:** HTTP Request (x3) + Code
**Sources:**
- Amazon Best Sellers (web scraping)
- Google Trends (RSS feed)
- Flipkart Trending (web scraping)

**Output:** Structured product data:
```json
{
  "productName": "Smart Kitchen Scale",
  "productUrl": "https://amazon.in/dp/B0EXAMPLE",
  "productImage": "https://images.amazon.in/...",
  "price": "₹599",
  "category": "Kitchen",
  "popularityScore": 85,
  "source": "Amazon Best Sellers"
}
```

### MODULE 3 — AI Product Filter

**Node:** HTTP Request (Kimi K2.5 API)
**Purpose:** Evaluate each product for Pinterest marketing potential

**Scoring Criteria (1-10 each):**
1. Visually Interesting
2. Problem Solving
3. Curiosity Factor
4. Low Competition
5. Affordability
6. Daily Life Usefulness

**Threshold:** Products must score ≥ 42/60 (70%) to pass

### MODULE 4 — Affiliate Link Generation

**Node:** HTTP Request (EarnKaro API)
**Purpose:** Convert product URLs to tracking affiliate links

**API Request:**
```json
POST /links/create
{
  "deal_url": "https://amazon.in/dp/B0EXAMPLE",
  "short_link": true,
  "campaign": "pinterest-auto-2026-03-12"
}
```

### MODULE 5 — Pin Content Generation

**Node:** HTTP Request (Kimi K2.5 API)
**Purpose:** Generate viral Pinterest titles, descriptions, and hashtags

**Title Rules:**
- Maximum 70 characters
- Curiosity-driven
- Emotion trigger
- Problem solving

**Example Outputs:**
- "This Genius Kitchen Tool Is Going Viral"
- "Nobody Talks About This Smart Gadget"
- "This ₹299 Tool Saves Hours Every Day"

### MODULE 6 — Image Prompt Generation

**Node:** Code
**Purpose:** Generate category-adaptive Stable Diffusion prompts

**Generates 3 variations per product:**
1. Clean Product Shot
2. Lifestyle Photography
3. Modern Design Style

**Prompt Template:**
```
Pinterest marketing pin design, vertical layout 1000x1500,
[product] centered prominently, [category-specific setting],
bright vibrant colors, clean modern design,
space for headline text at top, professional marketing aesthetic
```

### MODULE 7 — AI Image Generation

**Node:** HTTP Request (Stability AI API)
**Model:** Stable Diffusion XL 1.0
**Resolution:** 1024×1536 (Pinterest vertical format)
**Settings:** CFG Scale 7, 30 steps, photographic style

### MODULE 8 — Pin Assembly

**Node:** Code
**Purpose:** Combine all components into a complete pin object

**Board Mapping:**
| Category | Board Name |
|----------|-----------|
| Kitchen | Kitchen Gadgets |
| Gadgets | Smart Home Tools |
| Study | Study Productivity |
| Electronics | Tech Finds |
| Home | Home Essentials |
| Beauty | Beauty Must-Haves |
| Fashion | Fashion Finds |
| Fitness | Fitness Gear |
| Default | Amazon Finds |

### MODULE 9 — Pin Publishing

**Node:** HTTP Request (Pinterest API v5) + Rate Limiter
**Endpoint:** `POST /v5/pins`
**Rate Limiting:**
- Maximum 25 pins per day per account
- 5-minute delay between pins
- Deferred pins scheduled for next day

### MODULE 10 — Data Storage

**Node:** HTTP Request (Webhook to storage)
**Fields Stored:**
- Product name, URL, affiliate link
- Pin title, description, image URL
- Pinterest URL, pin ID
- Board name, category, price
- Publish date, batch ID, status

### MODULE 11 — Analytics

**Schedule:** Weekly (Monday at 10 AM)
**Reports:**
- Total pins generated vs published
- Success rate percentage
- Category breakdown
- Board breakdown
- Top performing categories

---

## Custom Node Packages

### n8n-nodes-pinterest

Full Pinterest API v5 integration:
- **Pin Operations:** Create, Get, Delete, Get Many
- **Board Operations:** Create, Get, Delete, Get Many
- **Authentication:** OAuth2
- **Image Support:** URL and binary data upload

### n8n-nodes-earnkaro

EarnKaro affiliate link management:
- **Create Affiliate Link** from any product URL
- **Get Link Details** for existing links
- **Get Earnings** summary with date range filters
- **Authentication:** Bearer token API key

### n8n-nodes-stability-ai

Stability AI image generation:
- **Generate Image** from text prompt (SDXL)
- **Image to Image** transformation
- **Upscale Image** to higher resolution
- **Get Account Balance**
- **Style Presets:** 16+ styles (photographic, cinematic, etc.)

---

## Error Handling Strategy

### Node-Level Error Handling
- All nodes use `continueOnFail` where appropriate
- Failed items are logged with error details
- Processing continues for remaining items

### Global Error Handler
- Captures errors from any pipeline stage
- Logs error details (node, message, code, execution ID)
- Supports retry metadata (max 3 retries, 1-minute delay)

### Retry Mechanism
```
Retry Strategy:
├── Attempt 1: Immediate
├── Attempt 2: After 60 seconds
├── Attempt 3: After 120 seconds
└── Final: Log error and skip item
```

### Rate Limiting
- Pinterest: Max 25 pins/day, 5-minute intervals
- API calls: Respect provider rate limits
- Deferred items: Automatically rescheduled to next day

---

## Scaling Strategy

### Phase 1: Single Account (1-25 pins/day)
- Default configuration
- Single Pinterest account
- Standard API rate limits

### Phase 2: Medium Scale (25-50 pins/day)
- Add time-distributed publishing
- Spread pins across morning and evening
- Multiple boards per category

### Phase 3: High Scale (50-100 pins/day)
- Multiple Pinterest accounts
- Parallel workflow executions
- Queue-based processing
- Dedicated storage (PostgreSQL)

### Phase 4: Enterprise (100+ pins/day)
- Multiple n8n instances
- Load balancing
- Redis queue for pin scheduling
- Dedicated image generation servers
- Real-time analytics dashboard

---

## Security Best Practices

1. **API Key Storage:** All API keys stored as n8n credentials or environment variables — never hardcoded
2. **OAuth2 Tokens:** Pinterest uses OAuth2 with automatic token refresh
3. **Rate Limiting:** Built-in rate limiting prevents account bans
4. **Input Validation:** All external data is validated before processing
5. **Error Isolation:** Node failures don't crash the entire pipeline
6. **Audit Trail:** All actions logged with timestamps for compliance
7. **Webhook Security:** Storage webhooks should use HTTPS with authentication

---

## Directory Structure

```
n8n/
├── package.json                                    # n8n deployment config
├── README.md                                       # This documentation
├── workflows/
│   └── pinterest-affiliate-marketing.json          # Complete workflow template
└── custom-nodes/
    ├── n8n-nodes-pinterest/                        # Pinterest API node
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── credentials/
    │   │   └── PinterestOAuth2Api.credentials.ts
    │   └── nodes/Pinterest/
    │       ├── Pinterest.node.ts
    │       ├── GenericFunctions.ts
    │       └── pinterest.svg
    ├── n8n-nodes-earnkaro/                         # EarnKaro API node
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── credentials/
    │   │   └── EarnKaroApi.credentials.ts
    │   └── nodes/EarnKaro/
    │       ├── EarnKaro.node.ts
    │       ├── GenericFunctions.ts
    │       └── earnkaro.svg
    └── n8n-nodes-stability-ai/                     # Stability AI node
        ├── package.json
        ├── tsconfig.json
        ├── credentials/
        │   └── StabilityAiApi.credentials.ts
        └── nodes/StabilityAi/
            ├── StabilityAi.node.ts
            ├── GenericFunctions.ts
            └── stabilityai.svg
```

---

## API Reference

### Pinterest API v5
- **Base URL:** `https://api.pinterest.com/v5`
- **Auth:** OAuth2 Bearer Token
- **Docs:** https://developers.pinterest.com/docs/api/v5/

### EarnKaro API
- **Base URL:** `https://ekaro.in/api/v1`
- **Auth:** Bearer Token API Key
- **Docs:** https://earnkaro.com/developers

### Stability AI API
- **Base URL:** `https://api.stability.ai`
- **Auth:** Bearer Token API Key
- **Docs:** https://platform.stability.ai/docs/api-reference

### Kimi K2.5 (Moonshot AI)
- **Base URL:** `https://api.moonshot.cn/v1`
- **Auth:** Bearer Token API Key
- **Docs:** https://platform.moonshot.cn/docs

---

## Prompt Templates

### Product Analysis Prompt (Module 3)
```
Analyze this product for Pinterest affiliate marketing potential:

Product: {productName}
Price: {price}
Category: {category}
Popularity Score: {popularityScore}

Evaluate based on these criteria (score 1-10 each):
1. Visually Interesting
2. Problem Solving
3. Curiosity Factor
4. Competition Level (10 = very low)
5. Affordability
6. Daily Life Usefulness

Approve ONLY if totalScore >= 42 (70% of 60 max).
```

### Pin Content Generation Prompt (Module 5)
```
Generate Pinterest pin content for this product:

Product: {productName}
Price: {price}
Category: {category}

Generate:
1. Pinterest Title (max 70 chars, curiosity-driven)
2. Pinterest Description (SEO optimized, with CTA and hashtags)
3. Curiosity Hook (one-liner click bait)
4. Keywords (5-8 Pinterest search keywords)
5. Hashtags (5 relevant hashtags)
6. Best Pinterest Board category
```

### Image Generation Prompt (Module 6)
```
Pinterest marketing pin design, vertical layout 1000x1500,
{productName} centered prominently,
{category-specific-setting},
bright vibrant colors, clean modern design,
space for headline text at top,
professional marketing aesthetic,
high quality product photography,
soft studio lighting, 4k detailed
```

---

## License

MIT
