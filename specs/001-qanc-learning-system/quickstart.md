# QANC Learning System - Developer Quickstart

**Project**: DayDayLearn - QANC card-based learning system  
**Date**: 2025-10-31  
**Branch**: `001-qanc-learning-system`

## Prerequisites

- Node.js 18+ 
- npm (package manager)
- Modern web browser with localStorage support
- VS Code or similar TypeScript-aware editor

## Initial Setup

### 1. Environment Setup
```bash
# Clone and navigate to project
cd /path/to/daydaylearn

# Ensure you're on the feature branch
git checkout 001-qanc-learning-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Project Structure Overview
```
app/
├── layout.tsx          # Root layout with responsive grid
├── page.tsx           # Main review interface (default route)
├── create/page.tsx    # Card creation interface
├── organize/page.tsx  # Category/tag management
├── components/        # Reusable UI components
├── lib/              # Business logic and utilities
└── types/            # TypeScript definitions
```

### 3. Key Technologies
- **Next.js 16.0.1**: React framework with App Router
- **React 19.2.0**: UI library
- **TypeScript**: Type safety and development experience
- **Tailwind CSS 4.x**: Utility-first styling
- **Zustand**: Lightweight state management
- **localStorage**: Client-side data persistence

## Development Workflow

### 1. Understanding the Data Flow
```
User Action → Component → Store Action → Repository → localStorage
                    ↓
User Interface ← Component ← Store State ← Repository ← localStorage
```

### 2. Core Concepts

#### Cards
- Atomic learning units with Q/A/Notes structure
- Unique questions enforced via normalization
- Scheduling based on Ebbinghaus forgetting curve
- Media attachments up to 5MB per file

#### State Management
```typescript
// Zustand store structure
interface AppState {
  cards: Card[];
  currentSession: ReviewSession | null;
  ui: {
    currentView: 'review' | 'create' | 'organize';
    selectedCard: string | null;
  };
}
```

#### localStorage Schema
- `qanc.cards.v1`: Card data array
- `qanc.reviews.v1`: Review history
- `qanc.settings.v1`: User preferences
- Schema versioning for future migrations

### 3. Key Files to Know

#### `/app/lib/store/cards.ts`
Zustand store for card management
```typescript
interface CardsState {
  cards: Card[];
  addCard: (card: CreateCardRequest) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<Card>;
  deleteCard: (id: string) => Promise<void>;
  getDueCards: () => Card[];
}
```

#### `/app/lib/storage/repository.ts` 
localStorage abstraction layer
```typescript
class Repository {
  async save<T>(key: StorageKey, data: T): Promise<void>;
  async load<T>(key: StorageKey): Promise<T | null>;
  async delete(key: StorageKey): Promise<void>;
}
```

#### `/app/lib/scheduler/spaced-repetition.ts`
Ebbinghaus curve implementation
```typescript
function calculateNextReview(
  result: 'pass' | 'fail',
  currentInterval: number,
  easeFactor: number
): { interval: number; easeFactor: number };
```

## Component Development

### 1. Component Architecture
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Container/Presenter**: Separate business logic from presentation
- **TypeScript**: Strict typing with interfaces

### 2. Styling Guidelines
```typescript
// Use Tailwind utilities with responsive prefixes
<div className="
  w-full max-w-4xl mx-auto 
  md:max-w-6xl lg:max-w-7xl
  bg-white dark:bg-gray-900
  rounded-2xl shadow-lg
">
```

### 3. Common Patterns

#### Data Fetching
```typescript
// Use Zustand selectors for reactive data
const dueCards = useCardsStore(state => state.getDueCards());
const addCard = useCardsStore(state => state.addCard);
```

#### Error Handling
```typescript
// Consistent error response structure
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

## Testing Strategy

**Note**: Per project constitution, NO automated testing is implemented.

### Manual Testing Checklist
1. **Card Creation**: Create cards with Q/A, add notes, attach media
2. **Review Flow**: Review due cards, submit answers, grade performance
3. **Organization**: Create categories/tags, filter and sort cards
4. **Persistence**: Verify data survives page refresh
5. **Responsive**: Test on mobile, tablet, and desktop screen sizes
6. **Edge Cases**: Empty states, large files, localStorage limits

### Browser Testing
- Chrome/Chromium (primary)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Common Tasks

### Adding a New Component
```bash
# Create component file
touch app/components/ui/NewComponent.tsx

# Basic component structure
export interface NewComponentProps {
  // Define props
}

export function NewComponent({ }: NewComponentProps) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

### Adding New Store State
```typescript
// In appropriate store slice
interface NewState {
  newProperty: string;
  setNewProperty: (value: string) => void;
}

const useNewStore = create<NewState>((set) => ({
  newProperty: '',
  setNewProperty: (value) => set({ newProperty: value }),
}));
```

### Adding localStorage Data
```typescript
// Update storage schema
interface StorageSchema {
  // ... existing keys
  'qanc.newData.v1': NewDataType[];
}

// Add repository methods
async saveNewData(data: NewDataType[]): Promise<void> {
  await this.save('qanc.newData.v1', data);
}
```

## Development Tips

### 1. localStorage Debugging
```javascript
// Browser console commands
localStorage.getItem('qanc.cards.v1');
localStorage.clear(); // Reset all data
Object.keys(localStorage).filter(k => k.startsWith('qanc.'));
```

### 2. TypeScript Tips
- Use strict null checks: `strictNullChecks: true`
- Leverage branded types: `type CardId = string & { readonly brand: unique symbol };`
- Create utility types: `type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;`

### 3. Performance Considerations
- Debounce localStorage writes (300ms)
- Use React.memo for expensive components
- Lazy load media content
- Index common query patterns in store selectors

## Deployment

### 1. Build for Production
```bash
npm run build
npm run start
```

### 2. Static Export (Vercel)
```bash
npm run build
# Outputs to .next/ directory
# Deploy to Vercel or any static hosting
```

### 3. Environment Variables
```bash
# .env.local (if needed for future features)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Troubleshooting

### Common Issues

#### localStorage Quota Exceeded
- Check file sizes in media attachments
- Implement cleanup for old review data
- Warn users about storage limits

#### Hydration Mismatches
- Ensure localStorage reads happen client-side only
- Use `useEffect` for localStorage-dependent state

#### TypeScript Errors
- Check interface definitions in `/types/`
- Verify store state shape matches usage
- Use type guards for runtime validation

### Debug Tools
- React Developer Tools
- Browser DevTools → Application → Local Storage
- TypeScript compiler (`npx tsc --noEmit`)

## Next Steps

After quickstart setup:
1. Run the application and explore existing functionality
2. Create a test card to understand the data flow
3. Review the component structure in `/app/components/`
4. Examine store implementation in `/app/lib/store/`
5. Check localStorage data structure in browser DevTools

For implementation tasks, refer to `tasks.md` when available from `/speckit.tasks` command.