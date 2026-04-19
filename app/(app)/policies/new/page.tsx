import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

import { PolicyForm } from "@/components/policy-form";
import { PageHeader } from "@/components/page-header";
import { RoleLocked } from "@/components/role-locked";
import { getPolicyStudioPayload } from "@/lib/demo-store";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PolicyCreatePage() {
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

  const payload = await getPolicyStudioPayload();

  return (
    <div className="min-w-0">
      <PageHeader
        title="Create policy"
        subtitle="A separate, focused setup flow for new controls. No library noise, just the fields needed to issue the next rule set."
        rightSlot={
          <Link
            href="/policies"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-[13px] font-medium text-ink hover:bg-surface"
          >
            <ChevronLeft className="size-4" />
            Back to library
          </Link>
        }
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <section className="panel max-w-4xl p-6 sm:p-7">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
              New spend policy
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-ink-muted">
              Define merchant controls, limits, and approval ownership. Once saved, this policy becomes available in issuance and transaction review.
            </p>
          </div>

          <PolicyForm
            grants={payload.grants}
            approvers={payload.approvers}
            mccOptions={payload.mccOptions}
            merchantOptions={payload.merchantOptions}
          />
        </section>
      </div>
    </div>
  );
}
