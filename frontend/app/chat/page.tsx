"use client";

import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RAGChat } from "@/components/chat/rag-chat";

export default function ChatPage() {
  return (
    <AppShell
      title="Knowledge Q&A Chat"
      description="Query your ingested documents and receive grounded answers with precise source attribution."
    >
      <RAGChat />
    </AppShell>
  );
}
