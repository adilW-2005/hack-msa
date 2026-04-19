"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { formatCurrency } from "@/lib/format";

interface Props {
  data: {
    day: number;
    date: string;
    ideal: number;
    actual: number | null;
    projected: number | null;
  }[];
  daysElapsed: number;
  totalAmount: number;
  projectedFinal: number;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TipPayload {
  value: number;
  name: string;
  color: string;
  dataKey: string;
}

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const has = (k: string) => payload.find((p) => p.dataKey === k);
  const ideal = has("ideal");
  const actual = has("actual");
  const projected = has("projected");
  return (
    <div className="bg-white border border-[var(--lumen-border)] rounded-xl px-3 py-2.5 shadow-lg text-[12px] min-w-[170px]">
      <p className="text-[var(--lumen-ink-muted)] mb-1.5 font-medium">
        {label ? formatDateShort(label) : ""}
      </p>
      {actual && actual.value !== null && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[var(--lumen-ink)]">
            <span className="w-2 h-2 rounded-full bg-olive-500" />
            Actual
          </span>
          <span className="font-semibold tabular">{formatCurrency(actual.value)}</span>
        </div>
      )}
      {projected && projected.value !== null && (
        <div className="flex items-center justify-between gap-3 mt-1">
          <span className="flex items-center gap-1.5 text-[var(--lumen-ink)]">
            <span className="w-2 h-2 rounded-full bg-olive-300" />
            Projected
          </span>
          <span className="font-semibold tabular">{formatCurrency(projected.value)}</span>
        </div>
      )}
      {ideal && (
        <div className="flex items-center justify-between gap-3 mt-1">
          <span className="flex items-center gap-1.5 text-[var(--lumen-ink-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--lumen-ink-subtle)]" />
            Ideal
          </span>
          <span className="tabular text-[var(--lumen-ink-muted)]">
            {formatCurrency(ideal.value)}
          </span>
        </div>
      )}
    </div>
  );
}

export function BurnRateChart({ data, totalAmount }: Props) {
  // Visible ticks: every ~5th point
  const visibleTicks = data
    .filter((_, i) => i % Math.max(1, Math.floor(data.length / 5)) === 0)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5C6B3A" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#5C6B3A" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" vertical={false} />

        <XAxis
          dataKey="date"
          ticks={visibleTicks}
          tickFormatter={formatDateShort}
          tick={{ fontSize: 11, fill: "#5B5B57" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "#5B5B57" }}
          axisLine={false}
          tickLine={false}
          width={60}
          domain={[0, Math.max(totalAmount, ...data.map((d) => d.ideal)) * 1.05]}
        />
        <Tooltip content={<Tip />} />

        {/* Budget ceiling */}
        <ReferenceLine
          y={totalAmount}
          stroke="#D3D0C5"
          strokeDasharray="4 4"
          label={{
            value: `Budget ${formatCurrency(totalAmount)}`,
            position: "insideTopRight",
            fill: "#5B5B57",
            fontSize: 11,
            offset: 6,
          }}
        />

        {/* Ideal linear line */}
        <Line
          type="linear"
          dataKey="ideal"
          stroke="#8A8A85"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={false}
        />

        {/* Actual filled area */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#5C6B3A"
          strokeWidth={2.5}
          fill="url(#actualGrad)"
          dot={false}
          connectNulls={false}
          activeDot={{ r: 4, fill: "#5C6B3A", strokeWidth: 0 }}
        />

        {/* Projected forward */}
        <Line
          type="monotone"
          dataKey="projected"
          stroke="#A8B382"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          connectNulls={false}
          activeDot={{ r: 3, fill: "#A8B382", strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
