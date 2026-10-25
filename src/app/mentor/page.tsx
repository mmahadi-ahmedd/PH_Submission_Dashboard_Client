"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { AppHeader } from "@/components/app-header";
import { StatsCards } from "@/components/mentor/stats-cards";
import { SubmissionsTable } from "@/components/mentor/submissions-table";

export default function MentorPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <RequireAuth role="MENTOR">
      <AppHeader title="Mentor Dashboard" />
      <main className="mx-auto max-w-6xl space-y-6 p-4">
        <StatsCards refreshKey={refreshKey} />
        <SubmissionsTable refreshKey={refreshKey} onReviewed={() => setRefreshKey((k) => k + 1)} />
      </main>
    </RequireAuth>
  );
}