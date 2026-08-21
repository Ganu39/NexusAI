import { 
  MessageSquare, Database, Search, FileText, 
  BrainCircuit, LayoutDashboard, ShieldCheck, 
  Users, Cloud, FileQuestion, GraduationCap, Server
} from "lucide-react";

export const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Roadmap", href: "#roadmap" },
  { name: "FAQ", href: "#faq" },
];

export const TRUSTED_TECH = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", 
  "FastAPI", "Python", "LangChain", "Gemini", 
  "FAISS", "Render", "Vercel", "Docker"
];

export const FEATURES = [
  {
    title: "Grounded RAG Chat",
    description: "Interactive Q&A grounded exclusively in your uploaded knowledge base with source citations.",
    icon: MessageSquare,
  },
  {
    title: "Multi-Format Ingestion",
    description: "Support to upload, parse, and extract structured text from PDF, TXT, and DOCX files.",
    icon: Database,
  },
  {
    title: "FAISS Semantic Search",
    description: "High-performance vector similarity search using L2-normalized Inner Product similarity.",
    icon: Search,
  },
  {
    title: "Page-Aware Chunking",
    description: "Recursive text splitting preserving page numbers, chunk indices, and document metadata.",
    icon: FileText,
  },
  {
    title: "Gemini Vector Embeddings",
    description: "3072-dimensional vector embedding generation using Google Gemini models.",
    icon: BrainCircuit,
  },
  {
    title: "Workspace Dashboard",
    description: "Real-time analytics monitoring total documents, storage usage, pages, and characters.",
    icon: LayoutDashboard,
  },
  {
    title: "Prompt Injection Defense",
    description: "Strict prompt framing isolating document context to defend against injection attacks.",
    icon: ShieldCheck,
  },
  {
    title: "Source Citations",
    description: "Answers include exact citations for filename, page number, chunk ID, and relevance score.",
    icon: FileQuestion,
  },
  {
    title: "Document Repository",
    description: "Centralized workspace for uploading, inspecting details, indexing, and safe metadata deletion.",
    icon: Server,
  },
  {
    title: "Production Infrastructure",
    description: "Decoupled cloud deployment running Next.js on Vercel and FastAPI on Render with persistent disk.",
    icon: Cloud,
  },
  {
    title: "Relevance Thresholding",
    description: "Automatic similarity score filtering with controlled fallback for low-relevance queries.",
    icon: GraduationCap,
  },
  {
    title: "Multi-Turn Context",
    description: "Built for extending conversation history and multi-turn knowledge retrieval.",
    icon: Users,
  },
];

export const HOW_IT_WORKS = [
  { step: "1", title: "Upload", description: "Upload PDF, TXT, or DOCX documents to the repository." },
  { step: "2", title: "Extract", description: "Format-specific extractors parse raw text and page numbers." },
  { step: "3", title: "Chunk", description: "Content is split into page-aware semantic chunks." },
  { step: "4", title: "Embed", description: "Chunks are embedded into vectors using Google Gemini." },
  { step: "5", title: "Retrieve", description: "Relevant context is fetched via FAISS similarity search." },
  { step: "6", title: "Answer", description: "Gemini synthesizes a grounded answer with citations." },
];

export const ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    title: "Backend Foundation",
    statusLabel: "COMPLETED",
    status: "completed",
    items: [
      "FastAPI backend",
      "Document upload and extraction",
      "Document management APIs",
      "Backend testing"
    ],
  },
  {
    phase: "Phase 2",
    title: "RAG Pipeline",
    statusLabel: "COMPLETED",
    status: "completed",
    items: [
      "Text chunking",
      "Gemini embeddings",
      "FAISS vector indexing",
      "Semantic search",
      "Grounded RAG answers",
      "Source attribution"
    ],
  },
  {
    phase: "Phase 3",
    title: "Production Integration",
    statusLabel: "COMPLETED",
    status: "completed",
    items: [
      "Production backend deployment",
      "Next.js frontend",
      "Document management UI",
      "Document upload & indexing workflow",
      "Grounded RAG Chat",
      "Production deployment",
      "UX and navigation improvements"
    ],
  },
  {
    phase: "Phase 4",
    title: "Production Hardening & RAG Quality",
    statusLabel: "COMPLETED",
    status: "completed",
    items: [
      "Persistent indexing status",
      "Improved document management",
      "Better source and citation experience",
      "Chat history",
      "Retry and error handling",
      "Document re-indexing",
      "Document search, filtering and sorting",
      "RAG quality improvements",
      "End-to-end production testing"
    ],
  },
  {
    phase: "Phase 5",
    title: "Advanced Infrastructure & Scale",
    statusLabel: "COMPLETED",
    status: "completed",
    items: [
      "Dual vector database (FAISS & Pinecone)",
      "Streaming RAG responses (SSE)",
      "User ID workspace isolation & custom naming",
      "Workspace Settings & System Telemetry"
    ],
  },
];

export const FAQ_ITEMS = [
  {
    question: "What is Retrieval-Augmented Generation (RAG)?",
    answer: "RAG is an AI architecture that retrieves relevant document excerpts from a vector database to ground large language models (LLMs) on factual data, delivering cited, non-hallucinated answers.",
  },
  {
    question: "Which models does NexusAI use?",
    answer: "NexusAI uses Google Gemini 2.5 Flash for grounded RAG answer synthesis and models/gemini-embedding-001 for generating 3072-dimensional vector embeddings.",
  },
  {
    question: "Is my document data secure?",
    answer: "Yes. Documents are processed through server-side environment variables (`GEMINI_API_KEY`), stored on isolated persistent disks, and shielded with prompt-injection defense instructions.",
  },
  {
    question: "How does vector search work in NexusAI?",
    answer: "Uploaded documents are chunked and stored in a local FAISS vector store. When you ask a question in RAG Chat, FAISS performs inner-product similarity search to find the most relevant chunks.",
  },
  {
    question: "What file types are supported?",
    answer: "NexusAI supports PDF, TXT, and DOCX document uploads with structured text extraction.",
  },
];
