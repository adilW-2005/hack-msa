import { unstable_noStore as noStore } from "next/cache";

import { ApprovalsView } from "@/components/approvals-view";
import { RoleLocked } from "@/components/role-locked";
import { getApprovalsPayload } from "@/lib/demo-store";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  noStore();
  const currentUser = await getSessionUser();

  if (currentUser.role === "case_manager") {
    return (
      <RoleLocked
        title="Approvals belong to Finance or Admin"
        body="Luis can issue cards and watch transactions, but the inbox stays with Marcus and Dana in this demo."
      />
    );
  }

  const data = await getApprovalsPayload(currentUser.id);

  return <ApprovalsView initialData={data} currentUser={currentUser} />;
}
