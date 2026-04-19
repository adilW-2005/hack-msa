# Lumen

Operations UI for the Hack MSA demo build of Lumen, a policy-first spend control app for nonprofits.

## What’s implemented

- Cookie-based role switching for Dana, Marcus, and Luis
- Policy Studio with live seeded policy creation
- Issue Card flow with virtual-card preview and reveal details
- Transactions stream with detail modal and swipe simulator
- Mobile-friendly approvals inbox with live polling
- Mock API surface for the demo contract:
  - `GET /api/transactions`
  - `GET /api/approvals`
  - `POST /api/approvals/[id]/approve`
  - `POST /api/approvals/[id]/decline`
  - `POST /api/issue-card`
  - `POST /api/demo/swipe`
  - `POST /api/policies`
  - `POST /api/session/role`

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
pnpm lint
pnpm build
```

The app was verified end to end with:

- lint
- a production build
- API smoke tests covering approve / decline / issue / retry flows
- a browser smoke test covering role switching, card issuance, simulator use, and the mobile approvals screen
