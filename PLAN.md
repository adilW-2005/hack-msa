# Lumen — Hackathon Demo Build Plan

> Programmable spend for nonprofits. Real Stripe virtual cards, real Twilio SMS approvals, everything else seeded or shortcut. The demo is fully functional on the critical path and convincing everywhere else.

---

## SECTION 0 — DEMO-FIRST PHILOSOPHY

This is not a product; it is a **convincing, clickable demo** that runs on a real Stripe Issuing test account and a real Twilio number. The rule for every feature:

> If it is on the demo path, it is **real**. If it is not on the demo path, it is **seeded, stubbed, or cosmetically faked** — but it always *looks* real on screen.

### What is REAL (no shortcuts)

- **Stripe Issuing virtual cards.** Real cardholders, real virtual cards, real card numbers visible via Stripe's ephemeral key flow. Created live during the demo.
- **Stripe real-time authorizations.** The `issuing_authorization.request` webhook fires for every simulated swipe, our engine decides, we call `approve`/`decline` inside the window. This is the core tech demo.
- **Stripe-native spending controls.** We set `spending_controls.allowed_categories` and `amount` limits on the card so Stripe itself enforces the basics, and our webhook provides the sophistication on top.
- **Twilio outbound SMS.** Approval requests really send to a real phone. Demo driver uses their own phone as the approver.
- **Twilio inbound SMS (YES/NO).** Real reply parsing on the Twilio webhook. This is the "wow" moment; it must work.
- **Policy-driven decisioning.** A simple but real rules engine — policy stored in DB, evaluated on every webhook.

### What is FAKE / SHORTCUT (but looks real)

- **Auth & multi-tenancy.** Single hardcoded organization. No signup. A "role switcher" dropdown in the header swaps between Dana (Admin), Marcus (Finance/Approver), Luis (Case Manager). No real sessions, no real passwords — just a cookie with the current user ID.
- **RBAC.** Role checks are UI-level only (hide buttons). No middleware enforcement needed.
- **Grants and budget lines.** Seeded as static DB rows at boot. Balances computed on the fly by summing transactions for that grant. No ledger service, no hold/capture/release lifecycle — just `total - sum(captured)`.
- **Policy versioning.** Skipped entirely. Policies are mutable; we never need to migrate existing cards in a demo.
- **Periodic limits (daily/weekly/monthly).** Skipped. Only per-transaction limit and total limit. Good enough for every demo scenario.
- **Funder report export.** Not generated dynamically. The "Export PDF" button opens a **pre-designed print-friendly HTML page** populated from live data, and the browser's native "Save as PDF" does the rest. Or we ship a pre-rendered PDF with placeholder fields swapped client-side.
- **Audit log.** A single `events` table we insert into. The "audit view" is a filtered list page. No cryptographic signatures, no replay engine, no read-model projections.
- **Voucher delivery to client.** We do *not* actually SMS test-mode card details to a "client." In the demo, Luis sees the voucher card details directly in the case manager UI (via Stripe's ephemeral key flow). If asked, we say "in production, the client receives a secure link."
- **Escalation & timeouts.** No background workers needed. If the approver doesn't respond, the transaction stays declined. Demo driver always responds.
- **Policy engine sophistication.** Plain imperative code, not a DSL. A function `decide(auth, card, policy, grant)` returns `approve | decline | require_approval` with a reason string.
- **Real landlord/grocer merchant allowlists.** Stripe test-mode authorizations use merchant descriptors we control via Stripe CLI / test helpers. We *pick* the merchant name at trigger time, so allowlist matching is trivially demonstrable.
- **Reporting charts.** Simple number cards + a single line/bar chart. No time-series database, no aggregation pipeline. `SELECT ... GROUP BY` on the transactions table.
- **Background jobs.** None. Everything is synchronous request/response or fires in the Stripe/Twilio webhook handler.
- **Policy approval chain / fallback approvers.** One approver per policy. No escalation tree.

### Demo path we will actually walk through

1. Dana creates a policy (live).
2. Luis issues a voucher card (live, real Stripe card).
3. Trigger an authorization at an allowed merchant → **auto-approved** in real time.
4. Trigger an authorization at a blocked merchant → **auto-declined** with reason.
5. Trigger an authorization that requires approval → Marcus gets a real text → replies `YES` → retry swipe → approved.
6. Dana opens the grant dashboard → sees live numbers → clicks "Export Funder Report" → a polished print-friendly page opens.

Everything else in the app is present and clickable but can be lightly populated or read-only.

---

## SECTION 1 — MINIMAL SYSTEM ARCHITECTURE

### 1.1 One process, one database, two webhooks

The whole thing runs as a **single Next.js app** (App Router) with one Postgres database (Neon or Supabase — free tier). Two inbound webhooks and two outbound APIs are the entire integration surface.

```
┌────────────────────────────────────────────────────┐
│                    Next.js app                     │
│                                                    │
│   App Router pages  ──►  Policy Studio / Issue /   │
│   (UI)                   Approvals / Dashboard     │
│                                                    │
│   Route handlers    ──►  /api/stripe/webhook       │
│                          /api/twilio/webhook       │
│                          /api/trigger-swipe (demo) │
│                                                    │
│   lib/decide.ts     ──►  Policy engine (pure fn)   │
│   lib/stripe.ts     ──►  Stripe Issuing client     │
│   lib/twilio.ts     ──►  Twilio Messaging client   │
│                                                    │
└──────────────┬─────────────────┬───────────────────┘
               │                 │
               ▼                 ▼
         Postgres (Neon)    Stripe Issuing (test)
                            Twilio Messaging (trial)
```

Webhook URLs are exposed via **ngrok** or **Cloudflare Tunnel** during the demo. No deploy needed unless you want one.

### 1.2 Core data model (the only tables we need)

Seven tables, all simple:

- **users** — `id`, `name`, `role` (`admin` | `finance` | `case_manager`), `phone` (for Marcus, the approver). Seeded, three rows.
- **grants** — `id`, `name`, `funder`, `total_amount`, `start_date`, `end_date`. Seeded, 3–4 rows.
- **policies** — `id`, `name`, `grant_id`, `mcc_allow` (array), `mcc_block` (array), `merchant_allow` (array of substrings), `per_txn_limit`, `total_limit`, `approval_threshold` (nullable), `approver_user_id` (nullable), `single_use` (bool), `window_days`. No versioning.
- **cardholders** — `id`, `type` (`staff` | `client`), `name`, `stripe_cardholder_id`.
- **cards** — `id`, `policy_id`, `cardholder_id`, `stripe_card_id`, `issued_by_user_id`, `issued_at`, `status`.
- **authorizations** — `id`, `stripe_auth_id`, `card_id`, `merchant_name`, `merchant_mcc`, `amount`, `decision` (`approved` | `declined` | `pending_approval`), `reason`, `rule_fired`, `approval_id` (nullable), `decided_at`.
- **approvals** — `id`, `authorization_id`, `approver_user_id`, `token`, `status` (`pending` | `approved` | `declined`), `sent_at`, `resolved_at`.

Transactions/captures: we use the `authorizations` table as the source of truth. When Stripe's `issuing_transaction.created` fires, we just mark the authorization as `captured` and store the final amount. No separate table.

Audit log: **skipped as a separate concept.** The `authorizations`, `approvals`, and a simple `events` table (if we even bother) cover every demo visualization need.

### 1.3 Policy engine — literally one function

```
decide(authorization, card, policy, grantRemaining) → {
  decision: "approve" | "decline" | "require_approval",
  reason: string,
  rule_fired: string
}
```

Logic, in order:

1. Card inactive or outside window → `decline`, reason `card_expired`.
2. Amount > policy.per_txn_limit → `decline`, reason `over_per_txn_limit`.
3. Card spent_total + amount > policy.total_limit → `decline`, reason `over_card_total`.
4. Grant remaining < amount → `decline`, reason `grant_exhausted`.
5. MCC in `mcc_block` or not in `mcc_allow` → `decline`, reason `mcc_blocked`.
6. Merchant name doesn't match any `merchant_allow` substring → `decline`, reason `merchant_not_allowed`.
7. Amount ≥ policy.approval_threshold and there is a pending-approval token for this card already approved in the last 10 minutes → `approve`, reason `approved_via_sms`.
8. Amount ≥ policy.approval_threshold → `require_approval`, reason `needs_sms_approval`.
9. Otherwise → `approve`, reason `within_policy`.

That's the whole engine. 40 lines of code.

### 1.4 Approval flow — optimistic decline + retry

Because we don't want to hold the Stripe authorization open waiting on a human, we use the simplest reliable pattern:

1. Engine returns `require_approval`.
2. We call Stripe **decline** with reason `verification_failed` and metadata `{lumen_reason: "needs_sms_approval", approval_id: "..."}`.
3. We insert a row in `approvals` with a short random `token` and status `pending`.
4. We send Twilio SMS to the policy's approver:
   > "Lumen: $320 at Discount Tire on card ••4291 (Program Ops). Reply YES to approve or NO to decline."
5. Twilio inbound webhook receives `YES`. We match to the pending approval by the sender's phone + most recent pending approval for that approver. Mark as `approved`.
6. Demo driver re-triggers the same swipe. New `issuing_authorization.request` fires. Engine checks step 7 of the decision logic, finds an approved token within the last 10 minutes for that card, **approves**, and marks the approval consumed.

No background jobs, no polling, no escalation. Matches the "hey retry the card" experience people already expect.

### 1.5 Triggering authorizations for the demo

We do not need a real terminal. Stripe provides two ways to generate test authorizations that fire the webhook exactly like a real swipe:

- **Stripe CLI**: `stripe issuing authorizations create --card cc_xxx --amount 14237 --merchant-data[category]=grocery_stores --merchant-data[name]='Safeway'`.
- **Stripe test helpers API**: hit `POST /v1/test_helpers/issuing/authorizations` from our app.

We wrap the second option in a single internal endpoint `/api/demo/swipe` that takes `{cardId, merchantName, mcc, amount}` and calls Stripe's test helper. The demo UI has a tiny "Swipe simulator" panel (three or four pre-filled buttons: *Swipe at Safeway*, *Swipe at liquor store*, *Swipe $320 at Discount Tire*) so the presenter can fire real authorizations with one click.

This is the **single most important shortcut**: instead of a physical terminal or a third-party test checkout, one button triggers a real Stripe authorization that travels through our webhook, hits our policy engine, and returns a real approval/decline. End-to-end real, no hardware.

### 1.6 Tech stack picks (opinionated, fixed)

- **Framework**: Next.js 15 (App Router), TypeScript.
- **DB**: Neon Postgres (free tier, serverless). Drizzle or Prisma for the schema — Drizzle preferred for simplicity.
- **UI**: Tailwind + shadcn/ui components. Pre-built cards, tables, dialogs, and forms, so we spend zero time on CSS.
- **Charts**: Recharts, one chart total.
- **Stripe**: `stripe` Node SDK, Issuing enabled in test mode.
- **Twilio**: `twilio` Node SDK, trial account + one verified number (approver's phone gets verified in trial).
- **Webhook tunneling**: Stripe CLI for local Stripe webhook forwarding; ngrok for Twilio's inbound SMS webhook.
- **Hosting (if deployed)**: Vercel. If not deployed, laptop + ngrok is fine for the demo.
- **Auth**: none. Just a cookie `lumen_user_id` set by the role switcher, read in a server helper.

No state management library, no queue, no Redis, no background worker, no search, no email. If the demo doesn't need it, it is not in the stack.

---

## SECTION 2 — PHASED BUILD PLAN (SIZED IN HOURS)

Three tight phases that fit inside a hackathon weekend. Total budget: **~20 hours of focused work** for a team of 2–3. The demo is fully functional at the end of Phase 2; Phase 3 is polish + storytelling.

### PHASE 1 — THE HOT PATH (6–8 hours)

**Goal:** end-to-end real transaction decisioning. You can issue a real Stripe virtual card, trigger a real authorization, and see it approved or declined by our engine.

#### Built

- Next.js project bootstrapped, Tailwind + shadcn installed.
- Postgres schema created (7 tables). Seed script inserts:
  - 3 users (Dana, Marcus with a real phone number, Luis).
  - 3 grants with reasonable totals.
  - 2 policies: *Community Grocery Voucher* (MCC 5411 only, $175 cap) and *Van & Field Ops* (MCC fuel + auto parts + office supplies, $500 cap).
- Role switcher dropdown in the header (no auth).
- Stripe Issuing client wired up. `createCardholder` and `createCard` helpers.
- **Issuance page** — pick a policy, pick/create a cardholder, click Issue. Real Stripe card created, shown in the UI with last4, exp, and a "Reveal full card details" action (Stripe ephemeral key flow on-demand — fine to build in Phase 2; for now show last4 only).
- **Stripe webhook handler** at `/api/stripe/webhook`. Signature verification. Handles `issuing_authorization.request` synchronously: loads card + policy + grant, runs `decide()`, calls `approve` or `decline` on Stripe, writes an `authorizations` row.
- **Demo swipe endpoint** `/api/demo/swipe` that hits Stripe test helpers. Three preset buttons on the dashboard: allowed, blocked, over-limit.
- **Transactions list page** — shows every authorization with card, merchant, MCC, amount, decision, reason. Auto-refreshes every 2 seconds (simple polling).
- Stripe CLI running locally to forward webhooks.

#### Not built (yet)

- No Twilio. No SMS. No approvals. Anything that would require approval is declined with reason `needs_sms_approval` as a placeholder.
- No grant dashboard. No reporting.
- No card reveal (show last4 only — Stripe ephemeral key flow lands in Phase 2).
- No policy creation UI — policies are seeded. Admin only sees a list.
- No voucher-specific flow — same issuance UI for staff and voucher.

#### What you can actually do at end of Phase 1

Dana can open the app, see the two seeded policies, click *Issue Card* on the Grocery policy for cardholder "Client R-4412," and get a real Stripe card. You click *Swipe at Safeway* — within a second the transactions list shows **APPROVED** with reason `within_policy`. You click *Swipe at liquor store* — it shows **DECLINED** with reason `mcc_blocked`. You click *Swipe $500 at Discount Tire* on the Ops card — **DECLINED** with reason `needs_sms_approval` (placeholder; Phase 2 makes this real).

The demo already tells a story at this point. Phase 2 makes it sing.

### PHASE 2 — APPROVALS + POLICIES + VOUCHERS (6–8 hours)

**Goal:** the full demo path works. Real SMS round-trip, policy creation UI, voucher flow, card details reveal.

#### Built

- **Twilio integration**: outbound SMS on `require_approval`, inbound webhook at `/api/twilio/webhook` that parses `YES`/`NO` and resolves the matching pending approval.
- Decision logic step 7 goes live: if an approved token exists for this card in the last 10 minutes, auto-approve on retry.
- **Approvals inbox page** (for Marcus) — pending approvals with approve/decline buttons. Same logic as SMS, different surface. (Takes 30 minutes, makes the demo feel complete.)
- **Policy Studio** — form to create/edit policies with all fields. Policies persist; the seeded ones appear as existing rows. This is now a demoable "create a policy live" beat.
- **Voucher flow** — when issuing a card on a policy flagged as voucher-style (a single boolean on the policy), the card reveal page shows the Stripe PAN/CVC/exp via ephemeral key. Nothing is actually SMS'd to a client; Luis sees the card details and we narrate "in production this is delivered via secure link to the client."
- **Card reveal**: Stripe ephemeral key flow implemented once, reused for staff and voucher cards.
- **Expanded swipe simulator**: add a "custom swipe" form (amount / merchant / MCC) so the presenter can handle any audience Q&A.
- **Better transactions list**: filters by card, by policy, by decision. Click a row → modal with full authorization detail + approval chain (if any).
- **Role-gated UI**: Dana sees Policy Studio, Luis sees Issuance only, Marcus sees the Approvals inbox and nothing else. Pure UI gating — no middleware.

#### Not built

- No policy versioning. Editing a policy just updates it.
- No escalation / timeouts on approvals.
- No grant balance math yet. The "remaining" number on the grant card is computed naively but the grant page itself is still minimal.
- No export. No audit log viewer.
- No client-side voucher delivery. No physical cards. No ACH. No accounting sync.

#### How it feels

The demo path is now 100% real and 100% working. A presenter can create a policy live, issue a card live, trigger real Stripe authorizations, and one of those authorizations really sends a text to a phone on stage that really gets replied to and really causes the next swipe to succeed. Nothing is mocked on the critical path.

### PHASE 3 — GRANTS, REPORTING, AND POLISH (4–6 hours)

**Goal:** the product *looks* like a mature platform. Dashboards, grant pages, a polished "funder report" export, and UI polish everywhere.

#### Built

- **Grant page** for each seeded grant: total, spent (computed as `SUM(authorizations.amount WHERE decision = approved AND grant_id = X)`), remaining, a list of every policy drawing from it, a list of every authorization, a single bar chart of spend by policy. No ledger service; just SQL aggregations.
- **Grant-remaining guard in the engine**: step 4 of `decide()` now reads the live sum and declines if grant is exhausted. Demonstrate this by setting a small grant total in seed data and exhausting it live on stage.
- **Executive dashboard**: landing page for Admin role. Total deployed across all grants, pending approvals count, flagged declines count, recent activity feed. All from simple aggregations.
- **Flagged Transactions view**: filter of the transactions list showing only declines + pending approvals with their reasons. This is Priya / Marcus's accountability view.
- **Funder report export**: a dedicated print-friendly page at `/grants/[id]/report` with a clean letterhead-style layout — grant metadata, totals, transactions table, approval summary, notes section. A "Download PDF" button that triggers `window.print()` to PDF. Done. This looks dramatically better than building a PDF generator.
- **Audit view**: one page that lists every policy edit, card issuance, approval decision, and authorization with timestamps + actor. Read-only. Pure DB query.
- **UI polish pass**: empty states, loading states, subtle animations on decision outcomes (a green flash on approve, red on decline), formatted currency everywhere, human-readable reason codes (`mcc_blocked` → "This purchase category isn't allowed by the card's policy.").
- **Seed data expansion**: a couple dozen "historical" authorizations spread over the last 30 days so the dashboard isn't empty when opened. Mix of approvals and declines across the seeded grants.

#### Not built (and explicitly not promised in the demo)

- No real accounting integration. If asked: "QuickBooks sync is on the roadmap."
- No physical cards. If asked: "Virtual-first is intentional for this market; physical is the logical next card type."
- No multi-org / fiscal sponsor hierarchy.
- No real ledger / double-entry. The architecture doc acknowledges this as the Phase-4 upgrade.
- No outcome tracking, no receipt capture, no donor portal.

#### How it feels

Complete. Every click lands on a page that looks populated and intentional. The numbers on the dashboard match the numbers on the grant page match the numbers on the funder report. A judge or investor clicking around finds no dead ends, and the demo path still runs end-to-end real.

---

## SECTION 3 — KEY PRODUCT INSIGHTS

### 3.1 What makes this fundamentally different from Ramp

Ramp optimizes for *velocity with hindsight* — give employees cards, catch misspending with ML, close the books faster. That framing doesn't fit nonprofits, where every dollar is often pre-restricted by a funder before it ever arrives.

Lumen is structurally different because **policies are the primitive, not cards**. A policy carries grant lineage, program intent, and approver chains; cards are instances of a policy. That one inversion — policy-first, not card-first — is what unlocks voucher-style client assistance, grant-aligned reports, and compliance at the point of swipe. Ramp would have to rebuild its core model to offer any of those.

### 3.2 Why policy-centric design matters, even in a demo

Even in this stripped-down build, *the database schema embodies the thesis*: the `cards` table has a foreign key to `policies`, and `policies` have a foreign key to `grants`. That means the demo itself is evidence of the architecture. When you show a grant page that sums transactions across every card issued under every policy of that grant, you're showing a structural property of the data model, not a feature someone bolted on.

### 3.3 Where the leverage is

One function, `decide()`, running inside one webhook handler, sitting between Stripe and our database. That is the entire technical moat of the demo. Everything else — UI, dashboards, reports — derives from what `decide()` writes to the DB. The leverage of the whole product collapses into a single pure function, and that is exactly why the demo is small enough to build in a weekend.

### 3.4 The "wow" moment

A single 60-second sequence on stage:

1. Swipe at Safeway → approved in real time, ledger ticks.
2. Swipe at liquor store → declined instantly with a clear reason.
3. Swipe $320 at Discount Tire → the presenter's phone buzzes in their hand with a real SMS → presenter replies `YES` on stage → swipe retried → approved → grant number ticks down.

Three authorizations, three different outcomes, all real, all driven by a policy that was either seeded or created moments ago on screen. That sequence *is* the pitch.

---

## SECTION 4 — DEMO SCRIPT

> Target length: 5–7 minutes. Everything in this script runs on a real Stripe Issuing test account and real Twilio trial account. Presenter keeps a phone in hand the entire time.

### Pre-demo checklist (10 minutes before)

- Laptop connected to projector. App running at `localhost:3000`.
- Stripe CLI forwarding webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- ngrok tunnel up for Twilio inbound: `ngrok http 3000`, Twilio number's SMS webhook pointed at the ngrok URL.
- Presenter's phone is the approver phone seeded in the DB. Signal is good.
- Role switcher starts on **Dana (Admin)**.
- Seeded historical data is present so the dashboard looks lived-in.

### Beat 1 — The problem (20 seconds, no clicks)

> "Nonprofits don't have a spending problem. They have a *restrictions* problem. Every grant comes with rules — this money is for rent, this one for food, this one for transport — and today those rules live in spreadsheets. Misallocations surface weeks later. Lumen enforces them at the moment of the swipe."

### Beat 2 — Create a policy live (60 seconds)

On the Admin dashboard as Dana. Click **Policy Studio → New Policy**.

- Name: *Emergency Rent Assistance — Q2*.
- Grant: *HUD ESG 2026*.
- Allowed categories: Real Estate / Rent.
- Allowed merchants: three preset landlord names.
- Per-transaction limit: $1,800.
- Approval threshold: $1,200 (approver: Marcus).
- Single-use.

Click **Save**. Policy appears in the list.

> "One policy, one minute. Every card issued under this policy now inherits every one of those rules."

### Beat 3 — Issue a voucher card live (30 seconds)

Switch role to **Luis (Case Manager)**. Open **Issue Card**.

- Policy: *Emergency Rent Assistance — Q2*.
- Cardholder: *Client R-4412*.
- Click **Issue**.

A real Stripe virtual card is created. Last-4 shown. Click **Reveal** — the full card appears via Stripe's ephemeral key flow.

> "That's a real card on Stripe's network. We could hand these details to a beneficiary right now."

### Beat 4 — Allowed swipe (20 seconds)

Switch back to **Dana**. Open the **Swipe Simulator** panel. Click **"$1,400 at Coastal Property Mgmt (MCC 6513)"**.

Within a second, the transactions list shows a new row: **APPROVED — within policy**. The grant balance on the dashboard ticks down $1,400.

Wait — this one is an amount that triggers approval. Let me re-order.

Actually: click **"$900 at Coastal Property Mgmt"** first. Approved instantly. *"Under the threshold, goes right through."*

### Beat 5 — Blocked swipe (20 seconds)

Click **"Swipe $40 at a liquor store (MCC 5921)"** on a different seeded voucher (Grocery).

Transactions list shows: **DECLINED — merchant category not allowed by policy**.

> "That decline happened at Stripe's network edge in under a second, because the policy told the card what it's for."

### Beat 6 — Approval by SMS — *the centerpiece* (60 seconds)

Click **"$1,400 at Coastal Property Mgmt"** on the rent voucher.

Transactions list shows: **HELD — awaiting SMS approval**. Presenter's phone buzzes *audibly on stage*. Hold the phone up to the camera:

> "Lumen: $1,400 rent payment at Coastal Property Mgmt on card ••7823. Reply YES to approve or NO to decline."

Reply **YES**. Approvals inbox in the UI refreshes — the pending approval flips to **approved**.

> "Now watch — the case manager retries the swipe."

Click **"Retry last swipe"**. Transactions list flips to **APPROVED — approved via SMS**. The grant balance ticks down.

> "Every piece of that — the hold, the text, the reply, the retry — is real. No simulations."

### Beat 7 — Grant view and funder report (45 seconds)

Click into the **HUD ESG 2026** grant page.

- Total: $200,000. Spent: $2,300. Remaining: $197,700.
- Table of every authorization under this grant with card, cardholder, merchant, decision.
- A bar chart of spend by policy under this grant.

Click **Export Funder Report**. A new tab opens with a clean, letterhead-style PDF-ready page: grant metadata, totals, transaction detail, approval chain, signed by timestamp.

> "This page was never reconciled. It was *generated* — from authorizations that were structured correctly the moment they happened. Month-end close for this grant is this click."

### Beat 8 — The close (15 seconds)

> "Every dollar you just watched move was compliant the instant it moved. Categorized the instant it moved. Reportable the instant it moved. Ramp helps companies spend faster. Lumen helps nonprofits spend correctly."

---

## SECTION 5 — SHORTCUTS CHEAT SHEET

One-page reference for every "wait, do we actually need to build that?" question that comes up during the hackathon. Default answer: **no**.

| Feature | Shortcut |
|---|---|
| User authentication | Cookie with `user_id`, role switcher dropdown. |
| Multi-tenancy | Single hardcoded org. No `org_id` column anywhere. |
| RBAC enforcement | Hide buttons in the UI. No server-side guards. |
| Policy versioning | Skip. Mutate policies in place. |
| Periodic limits | Skip. Per-txn + total only. |
| Funder report PDF | Print-friendly HTML page + browser "Save as PDF". |
| Audit log | One read-only page listing rows from existing tables. |
| Escalation / timeout on approvals | Skip. Demo presenter always replies. |
| Background jobs | None. Everything synchronous. |
| Ledger / double-entry | `SUM(approved authorizations)` on demand. |
| Voucher delivery to client | Show in UI, narrate "production delivers via secure link." |
| Stripe Connect / real Issuing account approval | Use test mode. No Connect, no onboarding. |
| Physical cards | Not in demo. Narrate as "logical next step." |
| Accounting sync | Not in demo. Narrate as "roadmap." |
| Policy DSL / rule builder | Hardcoded `decide()` function with fixed checks. |
| Multi-approver / approver hierarchies | One approver per policy. |
| Webhook signature verification in local dev | Use `stripe listen`'s forwarded signing secret; skip strict verification in dev if it blocks progress (but keep it for the real webhook at deploy time). |
| Unit tests | A few tests only for `decide()`. Everything else manual. |
| Deployment | Optional. Laptop + ngrok is a valid demo stance. |

### The only things that must actually work

- `/api/stripe/webhook` processes `issuing_authorization.request` and responds with approve/decline in under a second.
- `/api/twilio/webhook` receives a `YES`/`NO` SMS and resolves the matching pending approval.
- `/api/demo/swipe` hits Stripe test helpers to trigger authorizations.
- `decide()` returns correct decisions for the six scenarios in the demo script.
- Real Stripe virtual cards are created during the demo.
- Real outbound SMS reaches the presenter's phone.
- The dashboard's numbers match reality after each swipe.

Everything else is allowed to be imperfect, sparse, or pretty-but-static. The demo path is the only path that is load-bearing.

---
