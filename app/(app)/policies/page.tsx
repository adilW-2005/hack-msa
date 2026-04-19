import { unstable_noStore as noStore } from "next/cache";

import { PolicyStudioView } from "@/components/policy-studio-view";
import { RoleLocked } from "@/components/role-locked";
import { getPolicyStudioPayload } from "@/lib/demo-store";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  noStore();
  const currentUser = await getSessionUser();

  if (currentUser.role !== "admin") {
    return (
      <RoleLocked
        title="Policy Studio is reserved for Admin"
        body="Dana sets the policy. Marcus approves exceptions. Luis issues the resulting cards."
      />
    );
  }

  const payload = getPolicyStudioPayload();

  return <PolicyStudioView initialData={payload} />;
}
