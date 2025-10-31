# Implementation Plan: QANC Learning System

**Branch**: `001-qanc-learning-system` | **Date**: 2025-10-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-qanc-learning-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

QANC (Query Answer Notes Card) is a minimalist, single-screen card-based learning system that enables atomic knowledge capture and review through spaced repetition. The system operates entirely in the browser with local storage persistence, focusing on simple UX with mouse/touch interaction. Core features include card creation with Q/A/Notes structure, Ebbinghaus curve-based review scheduling, and organization via categories and tags.

## Technical Context

**Language/Version**: TypeScript with Next.js 16.0.1  
**Primary Dependencies**: React 19.2.0, Tailwind CSS 4.x, Zustand (state management)  
**Storage**: Browser localStorage for offline-first operation (cards, reviews, settings)  
**Testing**: NONE (per constitution - no testing infrastructure allowed)  
**Target Platform**: Web (mobile-first responsive design)
**Project Type**: Next.js web application (client-side only, static export)  
**Performance Goals**: <2s page load on 3G, Core Web Vitals "Good", 5MB max media files  
**Constraints**: Single-screen design (no scrolling), mobile-first, mouse/touch only (no keyboard shortcuts for MVP)  
**Scale/Scope**: Single-user system, estimated 1000+ cards capacity, 3 main views (review, create, organize)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Feature design maintains single responsibility principle and clear naming
- [x] **Simple UX**: User flows prioritize simplicity and minimal cognitive load
- [x] **Responsive Design**: All interfaces work seamlessly across mobile, tablet, and desktop
- [x] **Minimal Dependencies**: External dependencies are justified by significant value delivery
- [x] **No Testing**: Feature MUST NOT include any testing infrastructure or test files
- [x] **Technology Stack**: Uses Next.js 16.0.1, React 19.2.0, and Tailwind CSS 4.x only

**Post-Phase 1 Evaluation**: ✅ All constitutional principles maintained
- Clean Code: Component architecture follows atomic design with clear separation of concerns
- Simple UX: Single-screen design with intuitive mouse/touch interaction patterns  
- Responsive Design: CSS Grid layout adapts across all screen sizes without scrolling
- Minimal Dependencies: Only Zustand added for state management (lightweight, justified)
- No Testing: Research confirms manual testing approach aligns with constitution
- Technology Stack: All dependencies align with specified versions

## Project Structure

### Documentation (this feature)

```text
specs/001-qanc-learning-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# QANC Learning System Structure
app/
├── globals.css          # Global styles and Tailwind imports
├── layout.tsx          # Root layout with responsive grid
├── page.tsx            # Main review interface (default view)
├── create/
│   └── page.tsx        # Card creation interface
├── organize/
│   └── page.tsx        # Category/tag management and filters
├── components/         # Shared UI components
│   ├── card/          # Card display components
│   │   ├── CardView.tsx
│   │   ├── FaceQ.tsx
│   │   ├── FaceA.tsx
│   │   ├── FaceNote.tsx
│   │   └── MediaElement.tsx
│   ├── ui/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── ProgressIndicator.tsx
│   └── navigation/    # Navigation components
│       ├── CardNavigation.tsx
│       └── PreviewChips.tsx
├── lib/               # Core business logic
│   ├── store/        # Zustand state management
│   │   ├── cards.ts
│   │   ├── session.ts
│   │   └── ui.ts
│   ├── storage/      # localStorage abstraction
│   │   ├── repository.ts
│   │   └── migrations.ts
│   ├── scheduler/    # Ebbinghaus curve implementation
│   │   └── spaced-repetition.ts
│   └── validation/   # Business rules validation
│       └── card-rules.ts
└── types/            # TypeScript type definitions
    ├── card.ts
    ├── review.ts
    └── storage.ts

public/               # Static assets
├── icons/           # SVG icons for UI
└── favicon.ico
```

**Structure Decision**: Single-page application with three main routes (review, create, organize) using Next.js App Router. State management centralized in Zustand with localStorage persistence layer. Component architecture follows atomic design with clear separation between presentation and business logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
