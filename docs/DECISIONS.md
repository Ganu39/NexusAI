# Architecture Decisions

This document records the architectural decisions made during the development of NexusAI.

## Phase 1: Landing Page Foundation

**Date:** 2026-08-02

### 1. Separation of Data and Presentation
**Decision:** All static data (navigation links, features, pricing, FAQs) is stored in `lib/constants.ts` rather than being hardcoded into the React components.
**Reason:** Improves component readability, makes updates easier, and prepares the architecture for future CMS integration or internationalization.

### 2. Framer Motion for Animations
**Decision:** We adopted Framer Motion and created reusable wrappers (`AnimatedContainer`, `StaggerContainer`) for all scroll animations.
**Reason:** Instead of manually writing IntersectionObserver logic and complex CSS transitions for every section, reusable motion wrappers ensure consistent animation timing and behavior across the entire landing page with minimal code duplication.

### 3. Tailwind CSS & CSS Variables for Theming
**Decision:** The design system relies on CSS variables defined in `globals.css` that map to Tailwind classes in `tailwind.config.ts`.
**Reason:** This allows for seamless dark/light mode switching and makes it easy to completely re-theme the application (e.g., changing primary colors) by modifying a few variables instead of hundreds of utility classes.

### 4. Custom UI Components vs. Full Shadcn Installation
**Decision:** We selectively implemented only the necessary shadcn/ui components (`button`, `badge`, `card`, `separator`) and placed them in `components/ui/` rather than installing the entire library.
**Reason:** Reduces bundle size, keeps the codebase clean of unused components, and gives us full control over the exact styling implementation to match the Linear/Vercel-inspired premium aesthetic.

### 5. Final Phase 1 Polish
**Decision:** All marketing copy on the landing page was audited to clarify that backend features (RAG, Authentication, API) are planned/upcoming.
**Reason:** To ensure clear communication with early visitors that Phase 1 represents a visual frontend release only, and backend integration is not yet active.

## Phase 2A: Data Ingestion Foundation

**Date:** 2026-08-09

### 6. Modular Extraction Strategy & Structured Page Representation
**Decision:** Implemented separate text extractors (`PDFExtractor`, `TXTExtractor`, `DOCXExtractor`) returning a structured `pages` array `[{"page_number": int | None, "text": str}]` along with document metadata.
**Reason:** Keeps extraction decoupled from FastAPI routing, preserves page-level metadata required for future source attribution/citations, and provides a uniform data model across document formats.

### 7. File Ingestion Security & Temporary Lifecycle
**Decision:** Uploaded files undergo extension validation, MIME type checking, filename sanitization (basename + regex filtering), and size validation against `MAX_UPLOAD_SIZE_MB`. Files are saved to a configurable temporary directory under a UUID filename and deleted in a `finally:` block after extraction.
**Reason:** Prevents path traversal attacks, shell injection, disk exhaustion, and unauthorized persistent storage of uploaded user files.

