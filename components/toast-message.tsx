import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastMessageProps = {
  tone: "success" | "attention" | "error" | "info";
  title: string;
  body: string;
};

const toneMap = {
  success: {
    icon: CheckCircle2,
    bar: "bg-olive-500",
    text: "text-ink",
  },
  attention: {
    icon: AlertTriangle,
    bar: "bg-clay-500",
    text: "text-ink",
  },
  error: {
    icon: XCircle,
    bar: "bg-danger-500",
    text: "text-ink",
  },
  info: {
    icon: Info,
    bar: "bg-ink-muted",
    text: "text-ink",
  },
};

export function ToastMessage({ tone, title, body }: ToastMessageProps) {
  const Icon = toneMap[tone].icon;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_4px_12px_rgba(15,15,15,0.08),0_24px_48px_rgba(15,15,15,0.08)]">
      <div className={cn("absolute inset-y-0 left-0 w-1", toneMap[tone].bar)} />
      <div className="flex gap-3 px-4 py-4">
        <Icon className={cn("mt-0.5 size-4 shrink-0", toneMap[tone].text)} />
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-ink">{title}</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-muted">{body}</p>
        </div>
      </div>
    </div>
  );
}
