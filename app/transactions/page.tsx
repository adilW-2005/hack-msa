import { Topbar } from "@/components/layout/topbar";
import { TransactionsTable } from "@/components/shared/transactions-table";
import { getTransactions, buildTransactionDetails } from "@/lib/mock-data";

export default function TransactionsPage() {
  const transactions = getTransactions();
  const details = buildTransactionDetails(transactions);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Transactions" />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <p className="text-[13px] text-[var(--lumen-ink-muted)]">
              {transactions.length} transactions
            </p>
            <p className="text-[12px] text-[var(--lumen-ink-subtle)]">
              Click a row to see decision reasoning, rule fired, and approval chain.
            </p>
          </div>
          <TransactionsTable rows={transactions} details={details} showGrant />
        </div>
      </div>
    </div>
  );
}
