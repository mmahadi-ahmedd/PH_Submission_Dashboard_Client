"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function AppHeader({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name} ({user?.role.toLowerCase()})
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}