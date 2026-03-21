"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CourseFunnelChart({
  data,
}: {
  data: {
    position: number;
    title: string;
    completedByCount: number;
    percentOfEnrolled: number;
  }[];
}) {
  const chartData = data.map((d) => ({
    label: `${d.position}. ${d.title.length > 28 ? `${d.title.slice(0, 26)}…` : d.title}`,
    students: d.completedByCount,
    pct: d.percentOfEnrolled,
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No lessons in course structure — add modules in Sanity to see the funnel.
      </p>
    );
  }

  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="label"
            width={200}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              maxWidth: 320,
            }}
            formatter={(value: number, _name: string, item: { payload?: { pct?: number } }) => {
              const pct = item?.payload?.pct;
              return [`${value} students (${pct ?? 0}% of enrolled)`, "Completed"];
            }}
          />
          <Bar dataKey="students" name="students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
