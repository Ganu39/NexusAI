"use client";

import React from "react";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AppShell({
  children,
  title,
  description,
  action,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-5 backdrop-blur-md">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
              )}
            </div>
            {action && <div className="mt-4 md:mt-0">{action}</div>}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
