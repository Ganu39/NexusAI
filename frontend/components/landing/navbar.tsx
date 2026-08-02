"use client";

import Link from "next/link";
import { GitBranch, Menu, X } from "lucide-react";
import { useState } from "react";
import { useScroll } from "@/hooks/use-scroll";
import { NAV_LINKS } from "@/lib/constants";
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none tracking-tighter">N</span>
          </div>
          <span className="font-bold text-xl tracking-tight">NexusAI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="https://github.com/Ganu39/NexusAI" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <GitBranch className="w-5 h-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
          <Button>Get Started</Button>
        </div>

        <button 
          className="md:hidden p-2 text-muted-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-foreground py-2 border-b border-border/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-2 mt-2">
            <Button className="w-full">Get Started</Button>
            <Link href="https://github.com/Ganu39/NexusAI" target="_blank" rel="noreferrer" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <GitBranch className="w-4 h-4" /> GitHub
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
