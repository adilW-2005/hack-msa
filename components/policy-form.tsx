"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { ToastMessage } from "@/components/toast-message";
import type { Grant, MccOption, MerchantReference, User } from "@/lib/types";

type ToastState = {
  tone: "success" | "attention" | "error" | "info";
  title: string;
  body: string;
} | null;

type FormState = {
  name: string;
  grantId: string;
  mccAllow: string;
  mccBlock: string;
  merchantAllow: string;
  perTxnLimit: string;
  totalLimit: string;
  approvalThreshold: string;
  approverUserId: string;
  singleUse: boolean;
  windowDays: string;
};

type PolicyFormProps = {
  grants: Grant[];
  approvers: User[];
  mccOptions: MccOption[];
  merchantOptions: MerchantReference[];
  successHref?: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

type CsvField = "mccAllow" | "mccBlock" | "merchantAllow";

function joinCsv(values: string[]) {
  return values.join(", ");
}

export function PolicyForm({
  grants,
  approvers,
  mccOptions,
  merchantOptions,
  successHref = "/policies?created=1",
}: PolicyFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mccAllowQuery, setMccAllowQuery] = useState("");
  const [mccBlockQuery, setMccBlockQuery] = useState("");
  const [merchantQuery, setMerchantQuery] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "Emergency Rent Assistance - Q2",
    grantId: grants[0]?.id ?? "",
    mccAllow: "6513",
    mccBlock: "5921",
    merchantAllow: "Coastal Property Mgmt, Harbor Homes, Sunrise Apartments",
    perTxnLimit: "1800",
    totalLimit: "1800",
    approvalThreshold: "1200",
    approverUserId: approvers.find((user) => user.role === "finance")?.id ?? "",
    singleUse: true,
    windowDays: "14",
  });

  const selectedAllowMccs = splitCsv(form.mccAllow);
  const selectedBlockedMccs = splitCsv(form.mccBlock);
  const selectedMerchants = splitCsv(form.merchantAllow);

  const allowMccSuggestions = mccOptions
    .filter(
      (option) =>
        !selectedAllowMccs.includes(option.code) &&
        `${option.code} ${option.label}`.toLowerCase().includes(mccAllowQuery.toLowerCase()),
    )
    .slice(0, 8);

  const blockMccSuggestions = mccOptions
    .filter(
      (option) =>
        !selectedBlockedMccs.includes(option.code) &&
        `${option.code} ${option.label}`.toLowerCase().includes(mccBlockQuery.toLowerCase()),
    )
    .slice(0, 8);

  const merchantSuggestions = merchantOptions
    .filter(
      (option) =>
        !selectedMerchants.includes(option.name) &&
        option.label.toLowerCase().includes(merchantQuery.toLowerCase()),
    )
    .slice(0, 8);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateCsvField(field: CsvField, values: string[]) {
    setForm((current) => ({ ...current, [field]: joinCsv(values) }));
  }

  function addCsvValue(field: CsvField, value: string) {
    const currentValues = splitCsv(form[field]);

    if (currentValues.includes(value)) {
      return;
    }

    updateCsvField(field, [...currentValues, value]);
  }

  function removeCsvValue(field: CsvField, value: string) {
    updateCsvField(
      field,
      splitCsv(form[field]).filter((item) => item !== value),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await readJson<unknown>(
        await fetch("/api/policies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            grantId: form.grantId,
            mccAllow: splitCsv(form.mccAllow),
            mccBlock: splitCsv(form.mccBlock),
            merchantAllow: splitCsv(form.merchantAllow),
            perTxnLimit: Number(form.perTxnLimit),
            totalLimit: Number(form.totalLimit),
            approvalThreshold: form.approvalThreshold ? Number(form.approvalThreshold) : null,
            approverUserId: form.approverUserId || null,
            singleUse: form.singleUse,
            windowDays: Number(form.windowDays),
          }),
        }),
      );

      router.push(successHref);
      router.refresh();
    } catch (error) {
      setToast({
        tone: "error",
        title: "Policy creation failed",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <div>
            <label className="text-[13px] font-medium text-ink-muted">Policy name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink-muted">Grant</label>
            <select
              value={form.grantId}
              onChange={(event) =>
                setForm((current) => ({ ...current, grantId: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            >
              {grants.map((grant) => (
                <option key={grant.id} value={grant.id}>
                  {grant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-[13px] font-medium text-ink-muted">Allowed MCCs</label>
            <input
              value={form.mccAllow}
              onChange={(event) =>
                setForm((current) => ({ ...current, mccAllow: event.target.value }))
              }
              placeholder="6513"
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
            <p className="mt-2 text-[12px] leading-5 text-ink-muted">
              Add from a real MCC reference below or enter comma-separated codes manually.
            </p>
            <input
              value={mccAllowQuery}
              onChange={(event) => setMccAllowQuery(event.target.value)}
              placeholder="Search MCCs by code or description"
              className="mt-3 h-10 w-full rounded-[14px] border border-border bg-surface px-3 text-[13px] text-ink"
            />
            {selectedAllowMccs.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedAllowMccs.map((code) => {
                  const option = mccOptions.find((entry) => entry.code === code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => removeCsvValue("mccAllow", code)}
                      className="inline-flex items-center gap-2 rounded-full bg-olive-50 px-3 py-1.5 text-[12px] font-medium text-olive-700"
                    >
                      {option ? `${option.code} · ${option.label}` : code}
                      <X className="size-3" />
                    </button>
                  );
                })}
              </div>
            ) : null}
            {allowMccSuggestions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {allowMccSuggestions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => addCsvValue("mccAllow", option.code)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-ink hover:bg-surface"
                  >
                    <Plus className="size-3" />
                    {option.code} · {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink-muted">Blocked MCCs</label>
            <input
              value={form.mccBlock}
              onChange={(event) =>
                setForm((current) => ({ ...current, mccBlock: event.target.value }))
              }
              placeholder="5921"
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
            <p className="mt-2 text-[12px] leading-5 text-ink-muted">
              Ground the blocklist in the same MCC reference used by card networks.
            </p>
            <input
              value={mccBlockQuery}
              onChange={(event) => setMccBlockQuery(event.target.value)}
              placeholder="Search MCCs by code or description"
              className="mt-3 h-10 w-full rounded-[14px] border border-border bg-surface px-3 text-[13px] text-ink"
            />
            {selectedBlockedMccs.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedBlockedMccs.map((code) => {
                  const option = mccOptions.find((entry) => entry.code === code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => removeCsvValue("mccBlock", code)}
                      className="inline-flex items-center gap-2 rounded-full bg-clay-100 px-3 py-1.5 text-[12px] font-medium text-clay-700"
                    >
                      {option ? `${option.code} · ${option.label}` : code}
                      <X className="size-3" />
                    </button>
                  );
                })}
              </div>
            ) : null}
            {blockMccSuggestions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {blockMccSuggestions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => addCsvValue("mccBlock", option.code)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-ink hover:bg-surface"
                  >
                    <Plus className="size-3" />
                    {option.code} · {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-ink-muted">Merchant allowlist</label>
          <textarea
            value={form.merchantAllow}
            onChange={(event) =>
              setForm((current) => ({ ...current, merchantAllow: event.target.value }))
            }
            rows={4}
            className="mt-2 w-full rounded-[18px] border border-border-strong bg-white px-3 py-3 text-[14px] text-ink"
          />
          <p className="mt-2 text-[12px] leading-5 text-ink-muted">
            Suggestions below come from merchants already observed in transaction data.
          </p>
          <input
            value={merchantQuery}
            onChange={(event) => setMerchantQuery(event.target.value)}
            placeholder="Search observed merchants"
            className="mt-3 h-10 w-full rounded-[14px] border border-border bg-surface px-3 text-[13px] text-ink"
          />
          {selectedMerchants.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMerchants.map((merchant) => (
                <button
                  key={merchant}
                  type="button"
                  onClick={() => removeCsvValue("merchantAllow", merchant)}
                  className="inline-flex items-center gap-2 rounded-full bg-olive-50 px-3 py-1.5 text-[12px] font-medium text-olive-700"
                >
                  {merchant}
                  <X className="size-3" />
                </button>
              ))}
            </div>
          ) : null}
          {merchantSuggestions.length > 0 ? (
            <div className="mt-3 space-y-2">
              {merchantSuggestions.map((merchant) => (
                <button
                  key={merchant.name}
                  type="button"
                  onClick={() => addCsvValue("merchantAllow", merchant.name)}
                  className="flex w-full items-center justify-between rounded-[14px] border border-border bg-white px-3 py-3 text-left hover:bg-surface"
                >
                  <div>
                    <p className="text-[13px] font-medium text-ink">{merchant.name}</p>
                    <p className="mt-1 text-[12px] text-ink-muted">{merchant.label}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-olive-700">
                    <Plus className="size-3" />
                    Add
                  </span>
                </button>
              ))}
            </div>
          ) : merchantOptions.length === 0 ? (
            <p className="mt-3 text-[12px] text-ink-muted">
              No observed merchants yet. Authorize spend first, then allowlist from real traffic.
            </p>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-[13px] font-medium text-ink-muted">Per-transaction limit</label>
            <input
              value={form.perTxnLimit}
              onChange={(event) =>
                setForm((current) => ({ ...current, perTxnLimit: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink-muted">Card total limit</label>
            <input
              value={form.totalLimit}
              onChange={(event) =>
                setForm((current) => ({ ...current, totalLimit: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink-muted">Approval threshold</label>
            <input
              value={form.approvalThreshold}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  approvalThreshold: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink-muted">Window (days)</label>
            <input
              value={form.windowDays}
              onChange={(event) =>
                setForm((current) => ({ ...current, windowDays: event.target.value }))
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[18px] border border-border bg-surface px-4 py-4">
            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[14px] font-medium text-ink">Single-use card</p>
                <p className="mt-1 text-[12px] leading-5 text-ink-muted">
                  Use this for one-time assistance instead of a reusable balance.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.singleUse}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    singleUse: event.target.checked,
                  }))
                }
                className="size-4 accent-olive-700"
              />
            </label>
          </div>

          <div>
            <label className="text-[13px] font-medium text-ink-muted">Approver</label>
            <select
              value={form.approverUserId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  approverUserId: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            >
              <option value="">No approver</option>
              {approvers.map((approver) => (
                <option key={approver.id} value={approver.id}>
                  {approver.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !form.name.trim() || !form.grantId}
            className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-olive-700 px-5 text-[14px] font-medium text-white disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Save policy
          </button>
        </div>
      </form>

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
