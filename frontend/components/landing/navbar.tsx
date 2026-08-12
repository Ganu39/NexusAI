"use client";

import Link from "next/link";
import { GitBranch, Menu, X, Sparkles, FileText, MessageSquare, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const scrolled = useScroll(50);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-border shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">NexusAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/documents"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Documents</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>RAG Chat</span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Link href="https://github.com/Ganu39/NexusAI" target="_blank" rel="noreferrer">
              <GitBranch className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/20">
            <Link href="/dashboard">Open Workspace</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-foreground py-2 border-b border-border/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/documents"
            className="flex items-center gap-2 text-sm font-medium text-foreground py-2 border-b border-border/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Documents</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm font-medium text-foreground py-2 border-b border-border/50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>RAG Chat</span>
          </Link>
          <div className="flex flex-col gap-2 mt-2">
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                Open Workspace
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full gap-2">
              <Link href="https://github.com/Ganu39/NexusAI" target="_blank" rel="noreferrer">
                <GitBranch className="w-4 h-4" /> View GitHub Repository
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
