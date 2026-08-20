# NEXUS Landing Page

AI-powered analytics platform landing page with Three.js particle effects, glass morphism UI, and Early Access waitlist form backed by Supabase.

## Quick Start

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_KEY` — your Supabase service role key
4. Deploy

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run this SQL in the SQL Editor:

```sql
CREATE TABLE waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Copy the project URL and service role key to your Vercel environment variables.

## Stack

- HTML5, CSS3, JavaScript
- Three.js (WebGL particle network)
- GSAP (scroll animations)
- Supabase (waitlist database)
- Vercel (hosting + serverless API)

## Project Structure

```
├── index.html          # Main page
├── css/style.css       # Styles
├── js/
│   ├── main.js         # Animations, form, interactions
│   └── three-scene.js  # Three.js particle system
├── api/
│   └── subscribe.js    # Vercel serverless function
├── assets/             # Images, video, favicon
├── vercel.json         # Vercel config
└── package.json        # Dependencies
```
