import { unstable_noStore as noStore } from "next/cache";

import { IssueCardView } from "@/components/issue-card-view";
import { RoleLocked } from "@/components/role-locked";
import { getIssueCardPayload } from "@/lib/demo-store";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function IssueCardPage() {
  noStore();
  const currentUser = await getSessionUser();

  if (currentUser.role === "finance") {
    return (
      <RoleLocked
        title="Card issuance belongs to Admin or Case Manager"
        body="Marcus only approves threshold exceptions in this demo. Switch to Dana or Luis to issue new cards."
      />
    );
  }

  const payload = await getIssueCardPayload();

  return <IssueCardView initialData={payload} currentUser={currentUser} />;
}
