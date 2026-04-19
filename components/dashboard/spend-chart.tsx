"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/format";

interface SpendChartProps {
  data: { date: string; amount: number }[];
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[var(--lumen-border)] rounded-xl px-3 py-2 shadow-lg text-[12px]">
      <p className="text-[var(--lumen-ink-muted)] mb-0.5">
        {label ? formatAxisDate(label) : ""}
      </p>
      <p className="font-semibold text-[var(--lumen-ink)] tabular">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function SpendChart({ data }: SpendChartProps) {
  const visibleTicks = data
    .map((d, i) => ({ ...d, i }))
    .filter((_, i) => i % 7 === 0 || i === data.length - 1)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A8B382" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#A8B382" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E8E6DF"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          ticks={visibleTicks}
          tickFormatter={formatAxisDate}
          tick={{ fontSize: 12, fill: "#5B5B57" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={{ fontSize: 12, fill: "#5B5B57" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#5C6B3A"
          strokeWidth={2}
          fill="url(#spendGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#5C6B3A", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
