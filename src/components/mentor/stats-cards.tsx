"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const items: { key: keyof Stats; label: string; color: string }[] = [
  { key: "total", label: "Total", color: "" },
  { key: "pending", label: "Pending", color: "text-amber-600" },
  { key: "approved", label: "Approved", color: "text-green-600" },
  { key: "rejected", label: "Rejected", color: "text-red-600" },
];

export function StatsCards({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api<{ data: Stats }>("/mentor/stats")
      .then((res) => {
        if (cancelled) return;
        setStats(res.data);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ key, label, color }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <p className={`text-3xl font-bold ${color}`}>{stats[key]}</p>
            ) : failed ? (
              <p className="text-sm text-destructive">Failed to load</p>
            ) : (
              <Skeleton className="h-9 w-16" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}