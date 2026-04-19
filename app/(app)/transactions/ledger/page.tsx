import { unstable_noStore as noStore } from "next/cache";

import { ExpenseLedgerView } from "@/components/expense-ledger-view";
import { getTransactionsPayload } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export default async function ExpenseLedgerPage() {
  noStore();
  const data = await getTransactionsPayload();

  return <ExpenseLedgerView initialData={data} />;
}
