"use client";

import { Printer } from "lucide-react";

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-9 items-center gap-2 rounded-[14px] bg-olive-700 px-4 text-[13px] font-medium text-white"
    >
      <Printer className="size-4" />
      Save as PDF
    </button>
  );
}
