# Implementation Plan: Card-Based English Learning Interface

**Branch**: `001-card-learning-ui` | **Date**: November 1, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-card-learning-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a full-screen, card-based English vocabulary learning interface using Next.js (App Router) with React 19, TypeScript, and Tailwind CSS. The application features a dominant center card viewport for displaying flashcard questions/answers with CSS flip animations, a top control strip for category filtering and sorting, a bottom input panel (10% viewport height) for answer submission, a compact progress bar between card and panel, and overlay preview chips for adjacent cards. All card data is bundled as static JSON, user progress persists in browser localStorage (no authentication), and answer validation uses simple string matching with binary visual feedback (green ✅/red ❌). The interface is fully contained in a single non-scrolling viewport optimized for desktop and tablet.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.1 (App Router)  
**Primary Dependencies**: React 19.2.0, Tailwind CSS 4.x  
**Storage**: Browser localStorage for user progress (current card position, filters, sort order, completion stats)  
**Testing**: NONE (per constitution - no testing infrastructure allowed)  
**Target Platform**: Web desktop only
**Project Type**: Next.js web application (App Router, single-page interface)  
**Performance Goals**: <2s initial load on 3G, <100ms card flip animation, <50ms filter/sort operations  
**Constraints**: Single viewport (no scrolling), 100vh layout with fixed panel positions, mobile-first responsive breakpoints  
**Scale/Scope**: Single-page app, ~50-100 flashcards in initial JSON bundle, client-side only (no backend API)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clean Code**: Feature design maintains single responsibility principle (separate components for Card, ControlPanel, ProgressBar, FilterStrip, PreviewChips) with clear naming conventions
- [x] **Simple UX**: User flows prioritize simplicity - single-screen interface, binary feedback, minimal navigation (next/prev/preview only)
- [x] **Responsive Design**: All interfaces work seamlessly across mobile (≥375px), tablet (≥768px), and desktop (≥1024px) with adaptive layout
- [x] **Minimal Dependencies**: No external dependencies beyond Next.js, React, Tailwind CSS (all already in project). Uses native browser localStorage, CSS animations, and built-in string matching
- [x] **No Testing**: Feature MUST NOT include any testing infrastructure or test files
- [x] **Technology Stack**: Uses Next.js 16.0.1, React 19.2.0, and Tailwind CSS 4.x only

**Constitution Compliance**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Next.js App Directory Structure (DayDayLearn - Card Learning Feature)
app/
├── globals.css                    # Global styles + Tailwind directives
├── layout.tsx                     # Root layout (minimal wrapper)
├── page.tsx                       # Main learning interface (full-screen card view)
├── learn/                         # Feature directory for learning interface
│   ├── page.tsx                   # Primary learning page component
│   └── components/                # Feature-specific components
│       ├── FlashCard.tsx          # Main card component with flip animation
│       ├── ControlPanel.tsx       # Bottom input panel (10% height)
│       ├── ProgressBar.tsx        # Compact progress indicator
│       ├── FilterStrip.tsx        # Top category/filter/sort controls
│       ├── PreviewChip.tsx        # Adjacent card preview overlay
│       └── SessionComplete.tsx    # Completion screen (if needed)
├── components/                    # Shared components (if needed later)
├── lib/                          # Utility functions and shared logic
│   ├── flashcard-data.ts         # Load and parse JSON flashcard data
│   ├── storage.ts                # localStorage operations (progress persistence)
│   ├── answer-matcher.ts         # String matching logic for validation
│   └── card-shuffle.ts           # Shuffle and sort algorithms
├── types/                        # TypeScript type definitions
│   └── flashcard.ts              # Flashcard, Category, Session types
└── data/                         # Static data
    └── flashcards.json           # Bundled flashcard dataset

public/                           # Static assets
├── icons/                        # UI icons (checkmark, X, arrows)
└── images/                       # Future: card images if needed
```

**Structure Decision**: Using Next.js App Router with a dedicated `/learn` route for the flashcard interface. The main page (`app/page.tsx`) can serve as a landing/home page, while `app/learn/page.tsx` hosts the full-screen learning experience. All learning-specific components are co-located in `app/learn/components/` for feature isolation. Shared utilities in `lib/` and type definitions in `types/` follow Next.js conventions. Static flashcard data lives in `app/data/flashcards.json` for easy bundling and loading.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected** - All constitution principles satisfied:
- Clean Code: Component-based architecture with single responsibilities
- Simple UX: Single-screen interface, binary feedback, minimal controls
- Responsive Design: Mobile-first Tailwind breakpoints (sm/md/lg)
- Minimal Dependencies: Zero new dependencies (uses existing Next.js/React/Tailwind)
- No Testing: No test files or testing infrastructure included
- Technology Stack: Uses only Next.js 16.0.1, React 19.2.0, Tailwind CSS 4.x

---

## Phase 0: Research ✅ COMPLETE

**Output**: `research.md`

All technical unknowns resolved:
- CSS card flip animation strategy (3D transforms, 0 dependencies)
- Full-viewport layout approach (Flexbox with vh units)
- localStorage persistence pattern (single JSON key)
- Answer matching algorithm (case-insensitive exact match)
- JSON data structure and loading strategy
- Shuffle/sort algorithms (Fisher-Yates, native Array.sort)
- Responsive breakpoints (Tailwind defaults)
- Keyboard navigation (native event handlers)
- State management (React hooks, no external library)
- Error handling (graceful degradation)

**Key Decisions**:
- All implementations use native browser APIs and Tailwind utilities
- Zero additional dependencies beyond project baseline
- Performance targets: <100ms flip animation, <2s initial load

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Outputs**:
- `data-model.md` - Complete entity definitions, validation rules, state transitions
- `contracts/component-interfaces.md` - All component props, events, utility functions
- `quickstart.md` - Step-by-step implementation guide (4-5 hour estimate)
- `.github/copilot-instructions.md` - Updated with feature context

**Data Model**:
- 4 core entities: Flashcard, Category, UserProgress, LearningSession
- TypeScript interfaces with validation functions
- localStorage schema v1.0 defined
- State transition diagrams for session lifecycle

**Component Contracts**:
- 6 React components: FlashCard, ControlPanel, ProgressBar, FilterStrip, PreviewChip, SessionComplete
- 7 utility functions with type signatures
- Main page state management contract

**Agent Context**:
- GitHub Copilot instructions updated via `.specify/scripts/bash/update-agent-context.sh`
- Added: TypeScript 5.x, Next.js 16.0.1 (App Router), React 19.2.0, Tailwind 4.x, localStorage

---

## Phase 2: Task Breakdown

**Status**: NOT STARTED (requires `/speckit.tasks` command)

Phase 2 will generate `tasks.md` with:
- Granular implementation tasks (15-60 min each)
- Task dependencies and ordering
- Acceptance criteria per task
- Estimated total effort

**Do not proceed to Phase 2 in this command** - `/speckit.plan` stops after Phase 1.

---

## Constitution Re-Check (Post-Design)

*Re-evaluated after Phase 1 design completion:*

- [x] **Clean Code**: Component architecture maintains single responsibility - each component has one clear purpose (FlashCard = display, ControlPanel = input, etc.). Utility functions are pure and focused. Type definitions are centralized in `types/flashcard.ts`.

- [x] **Simple UX**: Design prioritizes simplicity - single-screen interface with no modals or complex navigation. User flow is linear: view question → type answer → see result → next card. Binary feedback (✅/❌) is unambiguous. Only 3 top-level controls (filter, sort, clear).

- [x] **Responsive Design**: Mobile-first Tailwind implementation with breakpoints at md (768px) and lg (1024px). Card viewport scales from 100% mobile to max-w-3xl desktop. Input panel adjusts from 15vh mobile to 10vh desktop. Preview chips hidden on mobile (`hidden lg:block`).

- [x] **Minimal Dependencies**: ZERO new dependencies added. Uses only existing project dependencies (Next.js 16.0.1, React 19.2.0, Tailwind 4.x). All functionality achieved with native APIs: CSS animations, localStorage, Array methods, string comparison.

- [x] **No Testing**: Design explicitly excludes any testing infrastructure. No test files in quickstart guide, no testing utilities in contracts, no test-related imports in component interfaces.

- [x] **Technology Stack**: Strictly uses Next.js 16.0.1 (App Router), React 19.2.0, and Tailwind CSS 4.x. No framework version upgrades, no alternative UI libraries, no CSS-in-JS solutions.

**Final Constitution Compliance**: ✅ PASSED - No violations, no complexity justification required.

---

## Generated Artifacts Summary

| Artifact | Path | Status | Size | Purpose |
|----------|------|--------|------|---------|
| Implementation Plan | `plan.md` | ✅ Complete | ~8KB | Master planning document |
| Research Findings | `research.md` | ✅ Complete | ~12KB | Technical decision rationale |
| Data Model | `data-model.md` | ✅ Complete | ~10KB | Entity definitions & validation |
| Component Contracts | `contracts/component-interfaces.md` | ✅ Complete | ~14KB | Component & utility interfaces |
| Quickstart Guide | `quickstart.md` | ✅ Complete | ~18KB | Step-by-step implementation |
| Agent Context | `.github/copilot-instructions.md` | ✅ Updated | ~2KB | AI coding assistant context |
| **Total Documentation** | - | - | **~64KB** | **6 files** |

---

## Ready for Implementation

**Next Command**: `/speckit.tasks` - Generate granular task breakdown

**Estimated Implementation Time**: 4-5 hours (per quickstart guide)

**Complexity Level**: Intermediate (React hooks, TypeScript, Tailwind CSS proficiency required)

**Recommended Implementation Order**:
1. Types & utilities (Step 1-3: ~55 min)
2. Core components (Step 4-6: ~90 min)
3. Main page integration (Step 7-8: ~105 min)
4. Landing page (Step 9: ~5 min)
5. Manual testing (Step 10: ~30 min)

**All prerequisites met for development start** ✅
