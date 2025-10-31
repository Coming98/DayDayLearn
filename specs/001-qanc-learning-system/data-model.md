# Data Model: QANC Learning System

**Date**: 2025-10-31  
**Feature**: QANC card-based learning system

## Core Entities

### Card
Represents an atomic learning unit with question, answer, and optional notes.

```typescript
interface Card {
  id: CardId;
  questionText: string;
  answerText: string;
  notes: Note[];
  category: CategoryId | null;
  tags: TagId[];
  metadata: CardMetadata;
  scheduling: SchedulingData;
  media: MediaAttachment[];
}

interface CardMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt: Date | null;
  importance: 1 | 2 | 3 | 4 | 5;
  archived: boolean;
}

interface SchedulingData {
  interval: number; // days until next review
  easeFactor: number; // 1.3 - 2.5
  dueAt: Date | null;
  reviewCount: number;
  passCount: number;
  failCount: number;
}
```

**Validation Rules**:
- Question text must be unique across all cards (normalized)
- Question and answer text are required
- Media attachments limited to 5MB per file
- Importance must be 1-5 integer

### Note
Represents additional context or examples for a card.

```typescript
interface Note {
  id: NoteId;
  cardId: CardId;
  text: string;
  order: number; // for display sequence
  mediaAttachment: MediaAttachment | null;
  createdAt: Date;
}
```

**Validation Rules**:
- Either text content or media attachment must be present
- Order must be unique within a card's notes

### MediaAttachment
Represents media files attached to cards or notes.

```typescript
interface MediaAttachment {
  id: MediaId;
  type: 'image' | 'audio' | 'video';
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string; // base64 encoded content
  attachedTo: 'question' | 'answer' | 'note';
  attachmentId: string; // CardId or NoteId
}
```

**Validation Rules**:
- Size must not exceed 5MB (5,242,880 bytes)
- MIME type must match declared type
- DataUrl must be valid base64 format

### Category
Represents a single organizational label for cards.

```typescript
interface Category {
  id: CategoryId;
  name: string;
  color: string; // hex color code
  createdAt: Date;
  cardCount: number; // derived field
}
```

**Validation Rules**:
- Name must be unique
- Color must be valid hex code
- Card count is automatically maintained

### Tag
Represents multiple organizational labels for cards.

```typescript
interface Tag {
  id: TagId;
  name: string;
  createdAt: Date;
  cardCount: number; // derived field
}
```

**Validation Rules**:
- Name must be unique
- Card count is automatically maintained

### ReviewEvent
Represents a single review session result.

```typescript
interface ReviewEvent {
  id: ReviewId;
  cardId: CardId;
  result: 'pass' | 'fail';
  userAnswer: string | null;
  reviewedAt: Date;
  timeSpentMs: number;
  previousInterval: number;
  newInterval: number;
}
```

**Validation Rules**:
- Result must be 'pass' or 'fail'
- TimeSpentMs must be positive
- Intervals must be positive integers

## Relationships

### Card → Category (Many-to-One)
- Each card belongs to at most one category
- Categories can have multiple cards
- Cascade: Deleting category sets card.category to null

### Card → Tags (Many-to-Many)
- Each card can have multiple tags
- Each tag can be associated with multiple cards
- Cascade: Deleting tag removes association from all cards

### Card → Notes (One-to-Many)
- Each card can have multiple notes
- Each note belongs to exactly one card
- Cascade: Deleting card deletes all associated notes

### Card → MediaAttachments (One-to-Many)
- Each card can have media attached to question/answer
- Each media attachment belongs to exactly one card
- Cascade: Deleting card deletes all associated media

### Card → ReviewEvents (One-to-Many)
- Each card can have multiple review events
- Each review event belongs to exactly one card
- Cascade: Deleting card deletes all review history

## Storage Schema

### localStorage Keys
```typescript
interface StorageSchema {
  'qanc.cards.v1': Card[];
  'qanc.categories.v1': Category[];
  'qanc.tags.v1': Tag[];
  'qanc.reviews.v1': ReviewEvent[];
  'qanc.media.v1': MediaAttachment[];
  'qanc.settings.v1': UserSettings;
  'qanc.schema.version': string; // "1.0"
}
```

### Data Integrity Rules
1. **Referential Integrity**: All foreign key references must be valid
2. **Atomic Updates**: All related changes must be saved together
3. **Backup on Write**: Previous state stored before mutations
4. **Schema Versioning**: Version conflicts prevent data corruption

## Query Patterns

### Common Queries
```typescript
// Cards due for review
const dueCards = cards.filter(card => 
  card.scheduling.dueAt && 
  card.scheduling.dueAt <= new Date() && 
  !card.metadata.archived
);

// Cards by category
const categoryCards = cards.filter(card => 
  card.category === categoryId
);

// Cards by tag
const taggedCards = cards.filter(card => 
  card.tags.includes(tagId)
);

// Recent reviews
const recentReviews = reviews
  .filter(review => review.reviewedAt >= startDate)
  .sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime());
```

### Performance Considerations
- In-memory caching of frequently accessed data
- Debounced writes to localStorage (300ms)
- Indexed access patterns for common queries
- Lazy loading of media content