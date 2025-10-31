# API Contracts: QANC Learning System

**Note**: This is a client-side only application using localStorage. These contracts represent the internal service layer API that components will interact with, not HTTP endpoints.

## Card Service Contract

### createCard
```typescript
interface CreateCardRequest {
  questionText: string;
  answerText: string;
  categoryId?: string;
  tagIds?: string[];
  importance?: 1 | 2 | 3 | 4 | 5;
  questionMedia?: File;
  answerMedia?: File;
}

interface CreateCardResponse {
  success: boolean;
  card?: Card;
  error?: {
    code: 'DUPLICATE_QUESTION' | 'VALIDATION_ERROR' | 'STORAGE_ERROR';
    message: string;
    field?: string;
  };
}
```

### updateCard
```typescript
interface UpdateCardRequest {
  cardId: string;
  questionText?: string;
  answerText?: string;
  categoryId?: string | null;
  tagIds?: string[];
  importance?: 1 | 2 | 3 | 4 | 5;
  archived?: boolean;
}

interface UpdateCardResponse {
  success: boolean;
  card?: Card;
  error?: {
    code: 'CARD_NOT_FOUND' | 'DUPLICATE_QUESTION' | 'VALIDATION_ERROR';
    message: string;
  };
}
```

### deleteCard
```typescript
interface DeleteCardRequest {
  cardId: string;
}

interface DeleteCardResponse {
  success: boolean;
  error?: {
    code: 'CARD_NOT_FOUND' | 'STORAGE_ERROR';
    message: string;
  };
}
```

### getCards
```typescript
interface GetCardsRequest {
  filters?: {
    categoryId?: string;
    tagIds?: string[];
    isDue?: boolean;
    archived?: boolean;
    importanceMin?: number;
    importanceMax?: number;
  };
  sort?: {
    field: 'createdAt' | 'updatedAt' | 'importance' | 'dueAt' | 'reviewCount';
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

interface GetCardsResponse {
  success: boolean;
  cards?: Card[];
  totalCount?: number;
  error?: {
    code: 'STORAGE_ERROR';
    message: string;
  };
}
```

## Review Service Contract

### startReviewSession
```typescript
interface StartReviewSessionRequest {
  filters?: {
    categoryId?: string;
    tagIds?: string[];
    maxCards?: number;
  };
}

interface StartReviewSessionResponse {
  success: boolean;
  session?: {
    sessionId: string;
    cards: Card[];
    currentIndex: number;
  };
  error?: {
    code: 'NO_CARDS_DUE' | 'STORAGE_ERROR';
    message: string;
  };
}
```

### submitReview
```typescript
interface SubmitReviewRequest {
  sessionId: string;
  cardId: string;
  result: 'pass' | 'fail';
  userAnswer?: string;
  timeSpentMs: number;
}

interface SubmitReviewResponse {
  success: boolean;
  reviewEvent?: ReviewEvent;
  updatedCard?: Card;
  nextCard?: Card | null;
  error?: {
    code: 'INVALID_SESSION' | 'CARD_NOT_FOUND' | 'STORAGE_ERROR';
    message: string;
  };
}
```

## Note Service Contract

### addNote
```typescript
interface AddNoteRequest {
  cardId: string;
  text: string;
  mediaFile?: File;
}

interface AddNoteResponse {
  success: boolean;
  note?: Note;
  error?: {
    code: 'CARD_NOT_FOUND' | 'VALIDATION_ERROR' | 'STORAGE_ERROR';
    message: string;
  };
}
```

### updateNote
```typescript
interface UpdateNoteRequest {
  noteId: string;
  text?: string;
  order?: number;
}

interface UpdateNoteResponse {
  success: boolean;
  note?: Note;
  error?: {
    code: 'NOTE_NOT_FOUND' | 'VALIDATION_ERROR';
    message: string;
  };
}
```

### deleteNote
```typescript
interface DeleteNoteRequest {
  noteId: string;
}

interface DeleteNoteResponse {
  success: boolean;
  error?: {
    code: 'NOTE_NOT_FOUND' | 'STORAGE_ERROR';
    message: string;
  };
}
```

## Media Service Contract

### uploadMedia
```typescript
interface UploadMediaRequest {
  file: File;
  attachTo: 'question' | 'answer' | 'note';
  attachmentId: string;
}

interface UploadMediaResponse {
  success: boolean;
  media?: MediaAttachment;
  error?: {
    code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'STORAGE_FULL' | 'ENCODING_ERROR';
    message: string;
    maxSize?: number;
    supportedTypes?: string[];
  };
}
```

### deleteMedia
```typescript
interface DeleteMediaRequest {
  mediaId: string;
}

interface DeleteMediaResponse {
  success: boolean;
  error?: {
    code: 'MEDIA_NOT_FOUND' | 'STORAGE_ERROR';
    message: string;
  };
}
```

## Category Service Contract

### createCategory
```typescript
interface CreateCategoryRequest {
  name: string;
  color: string;
}

interface CreateCategoryResponse {
  success: boolean;
  category?: Category;
  error?: {
    code: 'DUPLICATE_NAME' | 'INVALID_COLOR' | 'STORAGE_ERROR';
    message: string;
  };
}
```

### updateCategory
```typescript
interface UpdateCategoryRequest {
  categoryId: string;
  name?: string;
  color?: string;
}

interface UpdateCategoryResponse {
  success: boolean;
  category?: Category;
  error?: {
    code: 'CATEGORY_NOT_FOUND' | 'DUPLICATE_NAME' | 'INVALID_COLOR';
    message: string;
  };
}
```

### deleteCategory
```typescript
interface DeleteCategoryRequest {
  categoryId: string;
  reassignTo?: string; // Optional category to reassign cards to
}

interface DeleteCategoryResponse {
  success: boolean;
  affectedCardCount?: number;
  error?: {
    code: 'CATEGORY_NOT_FOUND' | 'STORAGE_ERROR';
    message: string;
  };
}
```

## Tag Service Contract

### createTag
```typescript
interface CreateTagRequest {
  name: string;
}

interface CreateTagResponse {
  success: boolean;
  tag?: Tag;
  error?: {
    code: 'DUPLICATE_NAME' | 'STORAGE_ERROR';
    message: string;
  };
}
```

### deleteTag
```typescript
interface DeleteTagRequest {
  tagId: string;
}

interface DeleteTagResponse {
  success: boolean;
  affectedCardCount?: number;
  error?: {
    code: 'TAG_NOT_FOUND' | 'STORAGE_ERROR';
    message: string;
  };
}
```

## Error Handling Standards

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_QUESTION`: Question text already exists
- `DUPLICATE_NAME`: Category/tag name already exists  
- `CARD_NOT_FOUND`: Referenced card doesn't exist
- `STORAGE_ERROR`: localStorage operation failed
- `STORAGE_FULL`: localStorage quota exceeded
- `FILE_TOO_LARGE`: Media file exceeds 5MB limit
- `INVALID_TYPE`: Unsupported media file type
- `ENCODING_ERROR`: Base64 encoding failed

### Response Standards
- All responses include `success: boolean`
- Errors include `code` and human-readable `message`
- Additional context provided when helpful (field names, limits, etc.)
- Consistent error structure across all services