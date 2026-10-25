"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { AppHeader } from "@/components/app-header";
import { SubmissionForm } from "@/components/student/submission-form";
import { MySubmissions } from "@/components/student/my-submissions";

export default function StudentPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <RequireAuth role="STUDENT">
      <AppHeader title="Student Portal" />
      <main className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SubmissionForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-3">
          <MySubmissions key={refreshKey} />
        </div>
      </main>
    </RequireAuth>
  );
}