# Research: QANC Learning System

**Date**: 2025-10-31  
**Feature**: QANC card-based learning system with spaced repetition

## Ebbinghaus Curve Implementation

**Decision**: Implement simplified Ebbinghaus forgetting curve with exponential backoff intervals

**Rationale**: The Ebbinghaus forgetting curve shows that memory retention follows an exponential decay pattern. For a learning system, this translates to scheduling reviews at increasing intervals based on successful recall. A simplified implementation uses base intervals that double on success and reset on failure.

**Algorithm**:
```typescript
interface ScheduleState {
  interval: number; // days
  easeFactor: number; // 1.3 - 2.5
}

function nextReview(current: ScheduleState, result: 'pass' | 'fail'): ScheduleState {
  if (result === 'pass') {
    const newEase = Math.min(2.5, current.easeFactor + 0.1);
    const newInterval = Math.ceil(current.interval * newEase);
    return { interval: newInterval, easeFactor: newEase };
  } else {
    const newEase = Math.max(1.3, current.easeFactor - 0.2);
    return { interval: 1, easeFactor: newEase };
  }
}
```

**Alternatives considered**: 
- Anki's SM-2 algorithm (too complex for MVP)
- Fixed intervals (1, 3, 7, 14, 30 days) (less adaptive)
- Leitner system (requires physical box metaphor)

## State Management Architecture

**Decision**: Use Zustand for state management with localStorage persistence

**Rationale**: Zustand provides a lightweight, TypeScript-friendly state management solution that aligns with the minimal dependencies principle. It offers better performance than Context API for complex state and simpler setup than Redux.

**Store Structure**:
```typescript
interface AppState {
  cards: CardsState;
  session: SessionState;
  ui: UIState;
}
```

**Alternatives considered**:
- React Context + useReducer (performance issues with frequent updates)
- Redux Toolkit (larger bundle size, more complex setup)
- Jotai (atoms might be overkill for this use case)

## localStorage Data Strategy

**Decision**: Store structured JSON in localStorage with versioned schemas and atomic updates

**Rationale**: localStorage provides 5-10MB storage capacity which is sufficient for thousands of cards with metadata. Versioned schemas enable future migrations. Atomic updates prevent corruption during writes.

**Storage Keys**:
- `qanc.cards.v1` - Array of card objects
- `qanc.reviews.v1` - Array of review events
- `qanc.settings.v1` - User preferences
- `qanc.media.v1` - Media file metadata (base64 or ObjectURL references)

**Alternatives considered**:
- IndexedDB (more complex API, better for large files but overkill for MVP)
- SessionStorage (doesn't persist across browser sessions)
- External database (violates offline-first requirement)

## Media File Handling

**Decision**: Store small media files as base64 in localStorage, with 5MB per file limit

**Rationale**: Base64 encoding allows storing media directly in localStorage for true offline capability. 5MB limit prevents localStorage quota exhaustion while allowing reasonable quality images and short audio clips.

**Implementation**:
```typescript
interface MediaItem {
  id: string;
  type: 'image' | 'audio' | 'video';
  mimeType: string;
  fileName: string;
  size: number;
  dataUrl: string; // base64 encoded
}
```

**Alternatives considered**:
- ObjectURL references (lost on page refresh)
- External CDN storage (requires internet connectivity)
- File system APIs (limited browser support)

## Single-Screen Layout Strategy

**Decision**: CSS Grid with fixed viewport height and internal scrolling regions

**Rationale**: Fixed viewport prevents vertical scrolling while maintaining responsive design. CSS Grid provides precise layout control for card positioning and control areas.

**Layout Structure**:
```css
.app-container {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "header"
    "main"
    "controls";
}
```

**Alternatives considered**:
- Flexbox (less precise control over complex layouts)
- Absolute positioning (responsive design complications)
- CSS Subgrid (limited browser support)

## Component Architecture

**Decision**: Atomic design with container/presenter pattern

**Rationale**: Atomic design scales well for component libraries while container/presenter separation enables easier manual testing by isolating business logic from presentation.

**Structure**:
- Atoms: Button, Input, Icon
- Molecules: MediaElement, ProgressIndicator  
- Organisms: CardView, NavigationControls
- Templates: ReviewLayout, CreateLayout
- Pages: ReviewPage, CreatePage

**Alternatives considered**:
- Feature-based organization (harder to maintain design consistency)
- Flat component structure (becomes unwieldy at scale)

## TypeScript Type Strategy

**Decision**: Domain-driven type definitions with strict null checks

**Rationale**: Domain types model the business concepts clearly while strict TypeScript settings catch potential runtime errors early, supporting the clean code principle.

**Core Types**:
```typescript
type CardId = string & { readonly brand: unique symbol };
type FaceType = 'question' | 'answer' | 'note';

interface Card {
  id: CardId;
  question: Face;
  answer: Face;
  notes: Face[];
  metadata: CardMetadata;
}
```

**Alternatives considered**:
- Loose typing with any/unknown (loses type safety benefits)
- Runtime validation libraries like Zod (adds dependency weight)
- Code generation from schema (adds build complexity)