"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Meta, Submission } from "@/types";

interface ListResponse {
  data: Submission[];
  meta: Meta;
}

interface Result {
  page: number; // which page this result belongs to
  items: Submission[];
  meta: Meta | null;
  error: string;
}

export function MySubmissions() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;

    api<ListResponse>(`/submissions/mine?page=${page}&limit=5`)
      .then((res) => {
        if (!cancelled) setResult({ page, items: res.data, meta: res.meta, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ page, items: [], meta: null, error: err.message ?? "Failed to load submissions" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // Derived values, no extra state needed
  const loading = !result || result.page !== page;
  const items = result?.items ?? [];
  const meta = result?.meta ?? null;
  const error = !loading ? result!.error : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>My submissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && items.length === 0 ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t submitted anything yet. Use the form to submit your first project.
          </p>
        ) : (
          items.map((s) => (
            <div key={s.id} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{s.projectName}</h3>
                <StatusBadge status={s.status} />
              </div>

              <p className="text-sm text-muted-foreground">{s.description}</p>

              <div className="flex flex-wrap gap-x-4 text-sm">
                <a href={s.repoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Repository
                </a>
                <a href={s.liveLink} target="_blank" rel="noopener noreferrer" className="underline">
                  Live site
                </a>
                <span className="text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>

              {s.feedbacks.length > 0 && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium">Mentor feedback</p>
                  {s.feedbacks.map((f) => (
                    <p key={f.id} className="mt-1">
                      {f.message}
                      <span className="text-muted-foreground"> — {f.mentor.name}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {meta && <Pagination meta={meta} onPageChange={setPage} disabled={loading} />}
      </CardContent>
    </Card>
  );
}