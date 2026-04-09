# Hookforge

Vercel-ready Next.js app for an Instagram Hook Generator micro SaaS.

## What is implemented

- Landing page and pricing
- Browser-based generator UX
- `POST /api/generate` API route
- OpenAI-backed generation when `OPENAI_API_KEY` is configured
- Local fallback generator when OpenAI is not configured
- Razorpay payment-link upgrade flow
- Supabase auth scaffold
- Privacy and terms pages
- Meta Pixel and Google Analytics placeholders
- Supabase schema starter in [supabase/schema.sql](./supabase/schema.sql)

## Project location

`C:\Users\manas\instagram-hook-generator`

## Environment setup

Copy `.env.example` to `.env.local` and fill what you have:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK=https://razorpay.me/manasmahodaya

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

OPENAI_API_KEY=

NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Vercel deployment

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Keep the framework preset as `Next.js`.
4. Add the environment variables from `.env.local` in Vercel Project Settings.
5. Deploy.
6. Add your custom domain in Vercel.
7. Point your domain DNS from Namecheap to Vercel using the records Vercel shows.

## Supabase setup

1. Create a Supabase project.
2. Copy the project URL and anon key into:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run the SQL in [supabase/schema.sql](./supabase/schema.sql).
4. Enable email auth in Supabase Authentication.
5. Set your site URL and redirect URL in Supabase auth settings:
   - `https://your-domain.com`
   - `https://your-domain.com/dashboard`

## OpenAI setup

1. Add `OPENAI_API_KEY`.
2. The app will use the `/api/generate` route automatically.
3. Without the key, the app falls back to local generation logic.

## Razorpay setup

1. Create or keep your payment link:
   - `https://razorpay.me/manasmahodaya`
2. Put it in `NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK`.
3. The pricing CTA and upgrade CTA will point to it.

## Meta and Google ads setup

1. Create a Meta Pixel and put the ID in `NEXT_PUBLIC_META_PIXEL_ID`.
2. Create a GA4 property and put the Google tag ID in `NEXT_PUBLIC_GA_ID`.
3. Redeploy after adding env vars.
4. Replace the draft legal text before running paid traffic.

## Build verification

```bash
npm run build
```

Production build currently passes.

## What still remains if you want full SaaS gating

- persist generations and saved hooks per authenticated user in Supabase
- add paid entitlement checks after Razorpay payment
- replace payment-link flow with a membership/gating flow if needed
- add dashboard analytics and usage limits
