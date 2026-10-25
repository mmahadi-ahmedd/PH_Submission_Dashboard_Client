"use client";

import { RequireAuth } from "@/components/require-auth";
import { AppHeader } from "@/components/app-header";

export default function MentorPage() {
  return (
    <RequireAuth role="MENTOR">
      <AppHeader title="Mentor Dashboard" />
      <main className="p-6">Mentor dashboard coming next.</main>
    </RequireAuth>
  );
}