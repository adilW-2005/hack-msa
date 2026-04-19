# Lumen — Hackathon Demo Build Plan

> Programmable spend for nonprofits. Real Stripe virtual cards, real-time approvals via an in-app inbox, everything else seeded or shortcut. The demo is fully functional on the critical path and convincing everywhere else.

---

## SECTION 0 — DEMO-FIRST PHILOSOPHY

This is not a product; it is a **convincing, clickable demo** that runs on a real Stripe Issuing test account. The rule for every feature:

> If it is on the demo path, it is **real**. If it is not on the demo path, it is **seeded, stubbed, or cosmetically faked** — but it always *looks* real on screen.

### What is REAL (no shortcuts)

- **Stripe Issuing virtual cards.** Real cardholders, real virtual cards, real card numbers visible via Stripe's ephemeral key flow. Created live during the demo.
- **Stripe real-time authorizations.** The `issuing_authorization.request` webhook fires for every simulated swipe, our engine decides, we call `approve`/`decline` inside the window. This is the core tech demo.
- **Stripe-native spending controls.** We set `spending_controls.allowed_categories` and `amount` limits on the card so Stripe itself enforces the basics, and our webhook provides the sophistication on top.
- **In-app approval inbox.** Pending approvals appear live in the approver's inbox (polled every 2s). Approver clicks Approve/Decline; the next swipe succeeds. Presenter opens the inbox on a second device (phone browser or tablet) to dramatize the "approver somewhere else" moment.
- **Policy-driven decisioning.** A simple but real rules engine — policy stored in DB, evaluated on every webhook.

### What is FAKE / SHORTCUT (but looks real)

- **Auth & multi-tenancy.** Single hardcoded organization. No signup. A "role switcher" dropdown in the header swaps between Dana (Admin), Marcus (Finance/Approver), Luis (Case Manager). No real sessions, no real passwords — just a cookie with the current user ID.
- **Out-of-band delivery (SMS / email / push).** Not in the demo. Approvals live entirely in the in-app inbox. If asked: *"SMS, email, and push are delivery adapters — the approval primitive is the pending token in our DB, and we can fan that out to any channel with a 20-line adapter."*
- **RBAC.** Role checks are UI-level only (hide buttons). No middleware enforcement needed.
- **Grants and budget lines.** Seeded as static DB rows at boot. Balances computed on the fly by summing transactions for that grant. No ledger service, no hold/capture/release lifecycle — just `total - sum(captured)`.
- **Policy versioning.** Skipped entirely. Policies are mutable; we never need to migrate existing cards in a demo.
- **Periodic limits (daily/weekly/monthly).** Skipped. Only per-transaction limit and total limit. Good enough for every demo scenario.
- **Funder report export.** Not generated dynamically. The "Export PDF" button opens a **pre-designed print-friendly HTML page** populated from live data, and the browser's native "Save as PDF" does the rest. Or we ship a pre-rendered PDF with placeholder fields swapped client-side.
- **Audit log.** A single `events` table we insert into. The "audit view" is a filtered list page. No cryptographic signatures, no replay engine, no read-model projections.
- **Voucher delivery to client.** We do *not* send test-mode card details to a "client." In the demo, Luis sees the voucher card details directly in the case manager UI (via Stripe's ephemeral key flow). If asked, we say "in production, the client receives a secure link."
- **Escalation & timeouts.** No background workers needed. If the approver doesn't respond, the transaction stays declined. Demo driver always responds.
- **Policy engine sophistication.** Plain imperative code, not a DSL. A function `decide(auth, card, policy, grant)` returns `approve | decline | require_approval` with a reason string.
- **Real landlord/grocer merchant allowlists.** Stripe test-mode authorizations use merchant descriptors we control via Stripe CLI / test helpers. We *pick* the merchant name at trigger time, so allowlist matching is trivially demonstrable.
- **Reporting charts.** Simple number cards + a single line/bar chart. No time-series database, no aggregation pipeline. `SELECT ... GROUP BY` on the transactions table.
- **Background jobs.** None. Everything is synchronous request/response or fires in the Stripe webhook / approval handlers.
- **Policy approval chain / fallback approvers.** One approver per policy. No escalation tree.

### Demo path we will actually walk through

1. Dana creates a policy (live).
2. Luis issues a voucher card (live, real Stripe card).
3. Trigger an authorization at an allowed merchant → **auto-approved** in real time.
4. Trigger an authorization at a blocked merchant → **auto-declined** with reason.
5. Trigger an authorization that requires approval → presenter picks up a second device (phone/tablet already on the Approvals inbox as Marcus) → a pending row appears → taps **Approve** → retry swipe → approved.
6. Dana opens the grant dashboard → sees live numbers → clicks "Export Funder Report" → a polished print-friendly page opens.

Everything else in the app is present and clickable but can be lightly populated or read-only.

---

## SECTION 1 — MINIMAL SYSTEM ARCHITECTURE

### 1.1 One process, one database, one webhook

The whole thing runs as a **single Next.js app** (App Router) with one Postgres database (Neon free tier). One inbound webhook (Stripe) is the entire third-party integration surface.

```
┌────────────────────────────────────────────────────┐
│                    Next.js app                     │
│                                                    │
│   App Router pages  ──►  Policy Studio / Issue /   │
│   (UI)                   Approvals / Dashboard     │
│                                                    │
│   Route handlers    ──►  /api/stripe/webhook       │
│                          /api/approvals/[id]/      │
│                            {approve,decline}       │
│                          /api/demo/swipe           │
│                                                    │
│   lib/decide.ts     ──►  Policy engine (pure fn)   │
│   lib/stripe.ts     ──►  Stripe Issuing client     │
│                                                    │
└──────────────┬─────────────────┬───────────────────┘
               │                 │
               ▼                 ▼
         Postgres (Neon)    Stripe Issuing (test)
```

The Stripe webhook is forwarded to localhost via `stripe listen` during the demo. No ngrok required; no deploy needed unless you want one.

### 1.2 Core data model (the only tables we need)

Seven tables, all simple:

- **users** — `id`, `name`, `role` (`admin` | `finance` | `case_manager`). Seeded, three rows.
- **grants** — `id`, `name`, `funder`, `total_amount`, `start_date`, `end_date`. Seeded, 3–4 rows.
- **policies** — `id`, `name`, `grant_id`, `mcc_allow` (array), `mcc_block` (array), `merchant_allow` (array of substrings), `per_txn_limit`, `total_limit`, `approval_threshold` (nullable), `approver_user_id` (nullable), `single_use` (bool), `window_days`. No versioning.
- **cardholders** — `id`, `type` (`staff` | `client`), `name`, `stripe_cardholder_id`.
- **cards** — `id`, `policy_id`, `cardholder_id`, `stripe_card_id`, `issued_by_user_id`, `issued_at`, `status`.
- **authorizations** — `id`, `stripe_auth_id`, `card_id`, `merchant_name`, `merchant_mcc`, `amount`, `decision` (`approved` | `declined` | `pending_approval`), `reason`, `rule_fired`, `approval_id` (nullable), `decided_at`.
- **approvals** — `id`, `authorization_id`, `card_id`, `approver_user_id`, `status` (`pending` | `approved` | `declined`), `requested_at`, `resolved_at`, `consumed_at` (nullable).

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
7. Amount ≥ policy.approval_threshold and there is an `approvals` row for this card with `status = approved` and `resolved_at` within the last 10 minutes (and not yet consumed) → `approve`, reason `approved_by_approver`. Mark that approval row as consumed.
8. Amount ≥ policy.approval_threshold → `require_approval`, reason `needs_approval`.
9. Otherwise → `approve`, reason `within_policy`.

That's the whole engine. 40 lines of code.

### 1.4 Approval flow — optimistic decline + retry

Because we don't want to hold the Stripe authorization open waiting on a human, we use the simplest reliable pattern:

1. Engine returns `require_approval`.
2. We call Stripe **decline** with reason `verification_failed` and metadata `{lumen_reason: "needs_approval", approval_id: "..."}`.
3. We insert a row in `approvals` with `status: pending`, linked to the `card_id` and `authorization_id`, assigned to the policy's approver.
4. The Approvals inbox page (server-polled every 2s, or SWR with a 2s interval) shows the new pending row with Approve / Decline buttons.
5. Approver clicks **Approve** → `POST /api/approvals/[id]/approve` flips the row to `status: approved`, sets `resolved_at: now()`.
6. Demo driver re-triggers the same swipe. New `issuing_authorization.request` fires. Engine checks step 7 of the decision logic, finds an approved row within the last 10 minutes for that card, **approves**, and marks the approval row consumed (a `consumed_at` timestamp, or a boolean — either is fine).

No background jobs, no external services, no escalation. Matches the "hey retry the card" experience people already expect.

> Why not show SMS/push in the demo? The delivery channel is a swappable adapter — we could fan this pending row out to SMS, email, Slack, or push in ~20 lines. The load-bearing primitive is the pending approval row, and that is what we're demoing.

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
- **Webhook tunneling**: Stripe CLI for local Stripe webhook forwarding. That's it.
- **Hosting (if deployed)**: Vercel. If not deployed, laptop + Stripe CLI is fine for the demo.
- **Auth**: none. Just a cookie `lumen_user_id` set by the role switcher, read in a server helper.

No state management library, no queue, no Redis, no background worker, no search, no email. If the demo doesn't need it, it is not in the stack.

---

## SECTION 2 — PARALLEL BUILD PLAN FOR 3 PEOPLE

This plan is intentionally split into **three decoupled workstreams** so three people can build in parallel without constantly waiting on each other. Everyone works in the same Next.js repo, but each person owns a mostly independent surface with a narrow contract.

### 2.1 The rule: decouple by contract, not by page

Each workstream gets:

- a small set of routes/components it owns,
- a small set of DB tables or queries it is allowed to depend on,
- one or two integration points with the other tracks,
- a fallback seeded mode so the UI can progress before the live backend is finished.

The point is not to avoid integration entirely. The point is to make sure each person can be productive for 6–8 hours **without being blocked** by the other two.

### 2.2 The three workstreams

#### Workstream A — Card + auth engine

**Owner:** the most backend-comfortable person.

**Owns**

- Stripe client helpers in `lib/stripe.ts`
- Policy engine in `lib/decide.ts`
- DB schema + seed data
- `/api/stripe/webhook`
- `/api/demo/swipe`
- Card issuance mutations
- Approval-row creation / consumption logic

**Delivers**

- Real cardholder + card creation in Stripe test mode
- Real authorization handling in under a second
- `authorizations` rows written correctly
- `approvals` rows created on `require_approval`
- Approved-row reuse on retry

**Can work independently because**

- The UI people can stub against seeded `cards`, `authorizations`, and `approvals` rows before Stripe is fully wired.
- This owner does not need final styling or polished screens to prove the hot path works; Postman, curl, or a temporary admin page is enough.

#### Workstream B — Operations app UI

**Owner:** the strongest product/frontend person.

**Owns**

- App shell and navigation
- Role switcher
- Policy Studio
- Issue Card flow
- Approvals inbox
- Transactions list/detail modal
- Swipe simulator UI
- Mobile-friendly approval screen for second-device demoing

**Delivers**

- All demo-path screens are clickable and legible
- Dana / Marcus / Luis role-gated views
- Approver can tap Approve / Decline on a phone
- Presenter can trigger a swipe from the UI without touching CLI

**Can work independently because**

- This owner can start from mock JSON / seeded DB rows and ship all major surfaces before the real webhook behavior is done.
- The only hard contract needed from Workstream A is the shape of the records and endpoints.

#### Workstream C — Grants, reporting, and story layer

**Owner:** the person strongest at polish, analytics, and demo narrative.

**Owns**

- Executive dashboard
- Grant detail page
- Funder report page
- Audit/activity view
- Historical seed data
- Copy polish, reason-label mapping, and presentational consistency

**Delivers**

- The app looks complete outside the hot path
- Dashboard numbers reconcile with transactions
- Grant page and report page feel investor-ready
- Historical activity makes the product feel lived-in on first open

**Can work independently because**

- This owner only needs stable read models: `authorizations`, `approvals`, `policies`, `grants`, `cards`.
- Before live data is ready, seeded historical data is enough to build the entire reporting surface.

### 2.3 Shared contracts between workstreams

This is the thin layer everyone agrees on before writing much code.

#### Contract 1 — Database shape

These tables are the source of truth for all three tracks:

- `users`
- `grants`
- `policies`
- `cardholders`
- `cards`
- `authorizations`
- `approvals`

Workstream A may change the schema early, but after the first seed script lands, table names and key columns should stabilize quickly so Workstreams B and C are not churned by DB drift.

#### Contract 2 — Endpoint surface

Workstream B and C only need these endpoints to exist:

- `POST /api/demo/swipe`
- `POST /api/approvals/[id]/approve`
- `POST /api/approvals/[id]/decline`
- `POST /api/issue-card` (or a server action that does the same thing)
- `GET /api/transactions`
- `GET /api/approvals`
- `GET /api/dashboard`
- `GET /api/grants/[id]`

These can return mocked/seeded data at first, then become real without forcing UI rewrites.

#### Contract 3 — Core record shapes

The UI should assume these minimal fields exist:

- **Transaction row:** `id`, `merchant_name`, `merchant_mcc`, `amount`, `decision`, `reason`, `card_id`, `policy_name`, `cardholder_name`, `decided_at`
- **Approval row:** `id`, `amount`, `merchant_name`, `card_last4`, `cardholder_name`, `policy_name`, `status`, `requested_at`
- **Grant summary:** `id`, `name`, `funder`, `total_amount`, `spent_amount`, `remaining_amount`

If those shapes stay stable, frontend and reporting work can move fast even while the backend is still getting real.

### 2.4 What each person should build first

#### Person A — start with the hot path

Build in this order:

1. DB schema + seed script
2. Stripe client helpers
3. `decide()`
4. `/api/stripe/webhook`
5. `/api/demo/swipe`
6. Card issuance mutation
7. Approval-row creation + consume-on-retry

**Definition of done:** a real Stripe test card can be issued, a simulated swipe can be triggered, and the webhook writes the right decision to the DB.

#### Person B — start with the demo surfaces

Build in this order:

1. App shell + role switcher
2. Transactions list
3. Issue Card page
4. Approvals inbox
5. Swipe simulator panel
6. Policy Studio
7. Transaction detail modal

**Definition of done:** every hot-path action in the demo can be triggered from the UI, even if the data is initially seeded.

#### Person C — start with the “looks like a product” layer

Build in this order:

1. Seed historical data set
2. Executive dashboard
3. Grant detail page
4. Funder report page
5. Audit/activity view
6. Copy pass + empty states + formatting polish

**Definition of done:** a judge can click around beyond the demo path and the product still feels coherent and populated.

### 2.5 Integration order so nobody blocks

The merge sequence should be:

1. **Morning / first checkpoint:** agree on schema, endpoint names, and seed data shape.
2. **Then split:** A works on Stripe + webhook, B works on UI against mocked data, C works on dashboard/reporting against seeded data.
3. **Second checkpoint:** A lands real DB writes for `authorizations` and `approvals`; B swaps the inbox and transactions pages from mock data to real queries.
4. **Third checkpoint:** C points dashboard/report pages at the real aggregations once the tables are stable.
5. **Final polish pass:** everyone fixes copy, formatting, and demo-state rough edges together.

This way the only truly load-bearing dependency is that Workstream A eventually writes the right rows. Everything else can be scaffolded before that.

### 2.6 Fallback plan if one workstream slips

- If **Workstream A** slips: keep the UI demoable with seeded transaction rows and a fake Approve button, but keep Stripe card issuance real if at all possible.
- If **Workstream B** slips: demo the backend using a thin admin page plus the transactions table; do not block on beautiful UI.
- If **Workstream C** slips: keep the grant dashboard and report page mostly static; this hurts polish, not the core pitch.

This is the real reason to split the work this way: only one workstream is truly mission-critical, one is demo-critical, and one is polish-critical.

### 2.7 What “done enough” looks like by the end

If the three streams all land their minimums, the final demo looks like this:

- Person A made the money movement real.
- Person B made the operator workflow real.
- Person C made the product feel complete.

That is enough to win a hackathon. The architecture reads intentional, the demo path is real, and the rest of the product looks believable.

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
3. Swipe above the approval threshold → the pending approval appears on the finance lead's phone in the inbox → presenter taps **Approve** → swipe retried → approved → grant number ticks down.

Three authorizations, three different outcomes, all real, all driven by a policy that was either seeded or created moments ago on screen. That sequence *is* the pitch.

---

## SECTION 4 — DEMO SCRIPT

> Target length: 5–7 minutes. Everything in this script runs on a real Stripe Issuing test account. Presenter keeps a phone in hand the entire time — opened to the Approvals inbox as Marcus.

### Pre-demo checklist (10 minutes before)

- Laptop connected to projector. App running at `localhost:3000`.
- Stripe CLI forwarding webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- Presenter's phone is on the same network (or on a Vercel preview URL), browser open to `/approvals`, role switcher set to **Marcus**.
- Laptop role switcher starts on **Dana (Admin)**.
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

### Beat 6 — Approval by the finance lead — *the centerpiece* (60 seconds)

Click **"$1,400 at Coastal Property Mgmt"** on the rent voucher.

Transactions list on the laptop shows: **HELD — awaiting approval**.

> "That $1,400 is above the approval threshold Dana set. The card held — and Marcus, our finance lead, needs to sign off."

Presenter picks up their phone and tilts the screen toward the camera. Within two seconds, the Approvals inbox has a new row at the top: merchant, amount, card, cardholder, policy. The row has a subtle clay accent bar on the left.

Tap **Approve**. The row animates out.

> "Now the case manager retries the swipe."

Back on the laptop, click **"Retry last swipe"**. Transactions list flips to **APPROVED — approved by approver**. The grant balance ticks down.

> "Every piece of that — the hold, the pending approval appearing in real time on a separate device, the tap, the retry — is real. The delivery channel is a pluggable adapter: SMS, push, email, Slack all go through the same pending-approval primitive. We're showing the load-bearing part."

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
| Out-of-band approval delivery (SMS / push / email) | In-app inbox only. Narrate "delivery channel is a pluggable adapter; the primitive is the pending approval row." |
| Stripe Connect / real Issuing account approval | Use test mode. No Connect, no onboarding. |
| Physical cards | Not in demo. Narrate as "logical next step." |
| Accounting sync | Not in demo. Narrate as "roadmap." |
| Policy DSL / rule builder | Hardcoded `decide()` function with fixed checks. |
| Multi-approver / approver hierarchies | One approver per policy. |
| Webhook signature verification in local dev | Use `stripe listen`'s forwarded signing secret; skip strict verification in dev if it blocks progress (but keep it for the real webhook at deploy time). |
| Unit tests | A few tests only for `decide()`. Everything else manual. |
| Deployment | Optional. Laptop + Stripe CLI is a valid demo stance. |

### The only things that must actually work

- `/api/stripe/webhook` processes `issuing_authorization.request` and responds with approve/decline in under a second.
- `/api/demo/swipe` hits Stripe test helpers to trigger authorizations.
- `/api/approvals/[id]/approve` and `/api/approvals/[id]/decline` update pending approvals from the inbox.
- `decide()` returns correct decisions for the six scenarios in the demo script.
- Real Stripe virtual cards are created during the demo.
- Pending approvals appear on the approver's second device within a couple seconds.
- The dashboard's numbers match reality after each swipe.

Everything else is allowed to be imperfect, sparse, or pretty-but-static. The demo path is the only path that is load-bearing.

---
