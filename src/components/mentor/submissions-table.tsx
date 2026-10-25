"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { ReviewDialog, type ReviewTarget } from "@/components/mentor/review-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Meta, Submission, SubmissionStatus } from "@/types";

type StatusFilter = "ALL" | SubmissionStatus;

interface ListResponse {
  data: Submission[];
  meta: Meta;
}

interface Result {
  key: string;
  items: Submission[];
  meta: Meta | null;
  error: string;
}

const makeKey = (page: number, status: StatusFilter, refreshKey: number) =>
  `${page}:${status}:${refreshKey}`;

interface Props {
  refreshKey: number;
  onReviewed: () => void;
}

export function SubmissionsTable({ refreshKey, onReviewed }: Props) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [result, setResult] = useState<Result | null>(null);
  const [target, setTarget] = useState<ReviewTarget | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = makeKey(page, status, refreshKey);

    const query = new URLSearchParams({ page: String(page), limit: "10" });
    if (status !== "ALL") query.set("status", status); // the filter runs on the server

    api<ListResponse>(`/mentor/submissions?${query}`)
      .then((res) => {
        if (cancelled) return;
        // The last item on this page was just reviewed away: go back one page
        if (res.data.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setResult({ key, items: res.data, meta: res.meta, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key, items: [], meta: null, error: err.message ?? "Failed to load submissions" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, status, refreshKey]);

  const loading = result?.key !== makeKey(page, status, refreshKey);
  const items = result?.items ?? [];
  const meta = result?.meta ?? null;
  const error = !loading ? result?.error : "";

  function handleFilterChange(value: string | null) {
  if (!value) return;
  setStatus(value as StatusFilter);
  setPage(1); 
}

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Submissions</CardTitle>
        <Select value={status} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {!result ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {status === "ALL" ? "" : status.toLowerCase() + " "}submissions found.
          </p>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Feedback</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.student?.name}</p>
                      <p className="text-xs text-muted-foreground">{s.student?.email}</p>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <p className="font-medium">{s.projectName}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <a href={s.repoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          Repo
                        </a>
                        <a href={s.liveLink} target="_blank" rel="noopener noreferrer" className="underline">
                          Live
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="hidden max-w-48 lg:table-cell">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {s.feedbacks[0]?.message ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap md:table-cell">
                      {new Date(s.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => setTarget({ submission: s, action: "APPROVED" })}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setTarget({ submission: s, action: "REJECTED" })}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Reviewed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {meta && <Pagination meta={meta} onPageChange={setPage} disabled={loading} />}
      </CardContent>

      <ReviewDialog
        target={target}
        onClose={() => setTarget(null)}
        onDone={() => {
          setTarget(null);
          onReviewed(); // refreshes both the table and the stats
        }}
      />
    </Card>
  );
}