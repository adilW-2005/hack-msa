# Lumen

Hackathon demo app for Lumen, a policy-first spend control product for nonprofits.

## What's implemented

- Real Stripe Issuing backend hot path for card issuance, auth decisions, approvals, and webhook handling
- Cookie-based role switching for Dana, Marcus, and Luis
- Policy Studio, Issue Card, Transactions, Approvals, Dashboard, Grants, and Audit surfaces
- Grant-level pacing, budget health, expiring-fund warnings, and printable funder reports
- Swipe simulator and retry flow wired to the live backend contract
- DB schema, seed script, and focused `decide()` tests

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before running the live flow, set up `.env.local` from `.env.example`, then run:

```bash
npm run db:push
npm run db:seed
```

Forward Stripe webhooks locally with:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
