import { unstable_noStore as noStore } from "next/cache";

import { TransactionsView } from "@/components/transactions-view";
import { getTransactionsPayload } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  noStore();
  const data = await getTransactionsPayload();

  return <TransactionsView initialData={data} />;
}
