import { unstable_noStore as noStore } from "next/cache";

import { TransactionsView } from "@/components/transactions-view";
import { getTransactionsPayload } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  noStore();
  const data = getTransactionsPayload();

  return <TransactionsView initialData={data} />;
}
