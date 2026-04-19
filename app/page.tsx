const endpoints = [
  "POST /api/issue-card",
  "POST /api/demo/swipe",
  "POST /api/stripe/webhook",
  "GET /api/approvals",
  "POST /api/approvals/:id/approve",
  "POST /api/approvals/:id/decline",
  "GET /api/transactions",
];

export default function HomePage() {
  return (
    <main>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="badge badge-olive" style={{ marginBottom: 16 }}>
          Person A workstream
        </div>
        <h1 style={{ fontSize: 36, margin: "0 0 12px" }}>Lumen hot path</h1>
        <p style={{ color: "var(--ink-muted)", lineHeight: 1.7, margin: 0 }}>
          This repo now contains the backend implementation for the hackathon
          demo’s real-money path: schema, seeding, policy decisions, Stripe
          helpers, card issuance, authorization handling, approval reuse on
          retry, and read APIs for approvals and transactions.
        </p>
      </div>

      <div className="grid">
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Runbook</h2>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Copy <code>.env.example</code> to <code>.env.local</code>.</li>
            <li>Run <code>npm run db:push</code>.</li>
            <li>Run <code>npm run db:seed</code>.</li>
            <li>
              Start the app with <code>npm run dev</code>.
            </li>
            <li>
              Forward Stripe webhooks to{" "}
              <code>/api/stripe/webhook</code>.
            </li>
          </ol>
        </section>

        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Endpoints</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            {endpoints.map((endpoint) => (
              <li key={endpoint}>
                <code>{endpoint}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
