import { 
  MessageSquare, Database, Search, FileText, 
  BrainCircuit, LayoutDashboard, ShieldCheck, 
  Users, Cloud, FileQuestion, GraduationCap, Server
} from "lucide-react";

export const NAV_LINKS = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "Roadmap", href: "#roadmap" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

export const TRUSTED_TECH = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", 
  "FastAPI", "Python", "LangChain", "Gemini", 
  "FAISS", "PostgreSQL", "Docker", "AWS"
];

export const FEATURES = [
  {
    title: "AI Chat",
    description: "Conversational interface with memory and context tracking across your knowledge base.",
    icon: MessageSquare,
  },
  {
    title: "Multi-document RAG",
    description: "Upload and query across hundreds of documents simultaneously with precise retrieval.",
    icon: Database,
  },
  {
    title: "Semantic Search",
    description: "FAISS-powered vector similarity search for finding exactly what you need.",
    icon: Search,
  },
  {
    title: "AI Summary",
    description: "Automatically generate concise summaries of long documents and reports.",
    icon: FileText,
  },
  {
    title: "Flashcards",
    description: "Transform your documents into interactive flashcards for accelerated learning.",
    icon: BrainCircuit,
  },
  {
    title: "Quiz Generator",
    description: "Create interactive quizzes from any document to test your knowledge.",
    icon: FileQuestion,
  },
  {
    title: "OCR Extraction",
    description: "Extract text and data from images and scanned PDFs automatically.",
    icon: GraduationCap,
  },
  {
    title: "Analytics Dashboard",
    description: "Monitor usage, query patterns, and system performance in real-time.",
    icon: LayoutDashboard,
  },
  {
    title: "Team Collaboration",
    description: "Share knowledge bases and collaborate with team members seamlessly.",
    icon: Users,
  },
  {
    title: "Enterprise Security",
    description: "Role-based access control and secure session management.",
    icon: ShieldCheck,
  },
  {
    title: "Cloud Deployment",
    description: "Containerized deployment ready for Vercel, AWS, or your own infrastructure.",
    icon: Cloud,
  },
  {
    title: "API Ready",
    description: "Integrate NexusAI directly into your own applications with our robust API.",
    icon: Server,
  },
];

export const HOW_IT_WORKS = [
  { step: "1", title: "Upload", description: "Upload PDFs, Word docs, or text files." },
  { step: "2", title: "Extract", description: "Text is extracted and cleaned." },
  { step: "3", title: "Chunk", description: "Content is split into semantic chunks." },
  { step: "4", title: "Embed", description: "Chunks are converted to vector embeddings." },
  { step: "5", title: "Retrieve", description: "Relevant chunks are found via semantic search." },
  { step: "6", title: "Answer", description: "Gemini generates a precise, cited answer." },
];

export const ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    title: "Foundation",
    description: "Project setup, authentication, and base UI components.",
    status: "current",
  },
  {
    phase: "Phase 2",
    title: "Core RAG",
    description: "Document ingestion, vectorization, and retrieval pipeline.",
    status: "upcoming",
  },
  {
    phase: "Phase 3",
    title: "Chat Interface",
    description: "Conversational UI, streaming responses, and context management.",
    status: "upcoming",
  },
  {
    phase: "Phase 4",
    title: "Enterprise",
    description: "Analytics, RBAC, audit logging, and API keys.",
    status: "upcoming",
  },
  {
    phase: "Phase 5",
    title: "Scale",
    description: "Kubernetes orchestration, monitoring, and multi-tenancy.",
    status: "upcoming",
  },
];

export const PRICING_TIERS = [
  {
    name: "Community",
    price: "Free",
    description: "For individuals and small projects.",
    features: ["Up to 100 documents", "Basic RAG capabilities", "Community support", "Standard Gemini model"],
    cta: "Get Started Free",
    popular: false,
    available: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For professionals and teams needing more power.",
    features: ["Unlimited documents", "Advanced RAG & Semantic Search", "Priority support", "Gemini Pro model", "Analytics Dashboard"],
    cta: "Coming Soon",
    popular: true,
    available: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom requirements.",
    features: ["Custom deployments (AWS/K8s)", "SSO & Advanced RBAC", "Dedicated success manager", "Custom model fine-tuning", "SLA guarantees"],
    cta: "Coming Soon",
    popular: false,
    available: false,
  },
];

export const FAQ_ITEMS = [
  {
    question: "What is Retrieval-Augmented Generation (RAG)?",
    answer: "RAG is an AI framework that retrieves facts from an external knowledge base to ground large language models (LLMs) on the most accurate, up-to-date information and give users insight into the LLM's generative process.",
  },
  {
    question: "Which LLM does NexusAI use?",
    answer: "NexusAI uses Google's Gemini API for its generative capabilities, providing state-of-the-art reasoning, multimodal understanding, and fast response times.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. In enterprise deployments, your data remains in your own infrastructure (AWS/Docker). We use secure session management, role-based access control, and follow best security practices.",
  },
  {
    question: "Can I deploy NexusAI on-premise?",
    answer: "The Enterprise tier will support on-premise deployments via Kubernetes and Docker, allowing you to run the entire stack within your own VPC.",
  },
  {
    question: "What file types are supported?",
    answer: "We plan to support PDF, DOCX, TXT, MD, CSV, and common image formats (via OCR) for document ingestion.",
  },
];
