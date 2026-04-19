"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

const COLORS = ["#5C6B3A", "#A8B382", "#C96442", "#C79A1F", "#3F7D4E"];

interface Props {
  data: { id: string; name: string; spent: number; budget: number }[];
}

interface TipPayload {
  value: number;
  name: string;
  payload: { budget?: number };
}

function Tip({ active, payload }: { active?: boolean; payload?: TipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const budget = item.payload.budget ?? 0;
  const pct = budget > 0 ? Math.round((item.value / budget) * 100) : 0;
  return (
    <div className="bg-white border border-[var(--lumen-border)] rounded-xl px-3 py-2 shadow-lg text-[12px]">
      <p className="font-medium text-[var(--lumen-ink)] mb-0.5">{item.name}</p>
      <p className="tabular text-[var(--lumen-ink)] font-semibold">
        {formatCurrency(item.value)}
      </p>
      <p className="text-[11px] text-[var(--lumen-ink-muted)] tabular">
        {pct}% of {formatCurrency(budget, true)} budget
      </p>
    </div>
  );
}

export function PolicyBreakdownDonut({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.spent, 0);
  const filtered = data.filter((d) => d.spent > 0);
  const isEmpty = filtered.length === 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-[160px] h-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={isEmpty ? [{ name: "Unspent", spent: 1, budget: 1, id: "_" }] : filtered}
              dataKey="spent"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={isEmpty ? 0 : 3}
              stroke="none"
            >
              {(isEmpty ? ["#F3F1EA"] : filtered).map((_, i) => (
                <Cell
                  key={i}
                  fill={isEmpty ? "#F3F1EA" : COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            {!isEmpty && <Tooltip content={<Tip />} />}
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.05em] text-[var(--lumen-ink-subtle)]">
            Deployed
          </span>
          <span className="text-[20px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)]">
            {formatCurrency(total, true)}
          </span>
        </div>
      </div>

      {/* Legend */}
      <ul className="flex-1 min-w-0 space-y-2">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.spent / total) * 100) : 0;
          return (
            <li key={d.id} className="flex items-center gap-2.5 text-[13px]">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 min-w-0 truncate text-[var(--lumen-ink)]">
                {d.name}
              </span>
              <span className="tabular font-medium text-[var(--lumen-ink)] shrink-0">
                {formatCurrency(d.spent, true)}
              </span>
              <span className="tabular text-[11px] text-[var(--lumen-ink-subtle)] shrink-0 w-9 text-right">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
