# DayDayLearn

A card-based English vocabulary learning web application built with Next.js 16, React 19, and TypeScript.

## 🌟 Features

- **Interactive Flashcards**: Learn English vocabulary with beautiful 3D card flip animations
- **Category Filtering**: Filter cards by category (Verbs, Idioms, Adjectives, Advanced)
- **Smart Sorting**: Sort by Random, Alphabetical, Difficulty, or Least Practiced
- **Progress Tracking**: Automatically save your learning progress in browser localStorage
- **Preview Navigation**: Quick preview of adjacent cards with one-click navigation
- **Keyboard Shortcuts**: Navigate with arrow keys, submit with Enter
- **Responsive Design**: Optimized for mobile, tablet, and desktop (375px - 1920px+)
- **Binary Feedback**: Instant visual feedback (✅/❌) on answer correctness
- **Auto-Restart**: Automatically shuffle and restart when completing a session

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/Coming98/DayDayLearn.git
cd DayDayLearn

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.  
Click **"Start Learning →"** to begin using flashcards at `/learn`.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Usage

### Basic Learning Flow

1. **View Question**: A flashcard question is displayed in the center
2. **Type Answer**: Enter your answer in the bottom input panel
3. **Submit**: Press Enter or click "Submit"
4. **See Feedback**: Card flips to show correct answer with ✅ (correct) or ❌ (incorrect)
5. **Next Card**: Click "Next Card" or press Enter to continue

### Filtering & Sorting

- **Filter by Category**: Click category badges at the top (Verbs, Idioms, etc.)
- **Clear Filters**: Click "Clear All" to reset filters
- **Sort Cards**: Use the dropdown in top-right to change sort order
  - Random: Shuffled order (default)
  - Alphabetical: A-Z by question text
  - By Difficulty: Easy (1) to Hard (5)
  - Least Practiced: Cards you've seen least often first

### Keyboard Shortcuts

- **Enter**: Submit answer or go to next card
- **Arrow Left (←)**: Jump to previous card
- **Arrow Right (→)**: Jump to next card (or advance if answer revealed)
- **Escape**: Clear input field

### Preview Chips (Desktop Only)

On large screens (≥1024px), small preview chips appear in corners:
- **Top-Left**: Click to jump to previous card
- **Top-Right**: Click to jump to next card (hidden until current card answered)

## 🏗️ Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Storage**: Browser localStorage (no backend required)
- **Animation**: Native CSS 3D transforms

## 📂 Project Structure

```
app/
├── learn/                 # Learning interface feature
│   ├── page.tsx          # Main learning page
│   └── components/       # Feature components
│       ├── FlashCard.tsx
│       ├── ControlPanel.tsx
│       ├── ProgressBar.tsx
│       ├── FilterStrip.tsx
│       └── PreviewChip.tsx
├── lib/                  # Utility functions
│   ├── flashcard-data.ts
│   ├── storage.ts
│   ├── answer-matcher.ts
│   └── card-shuffle.ts
├── types/                # TypeScript definitions
│   └── flashcard.ts
├── data/                 # Static data
│   └── flashcards.json
├── globals.css           # Global styles + animations
└── page.tsx              # Landing page
```

## 🧪 Manual Testing Checklist

### User Story 1: Core Learning Flow ✅
- [ ] Page loads and displays first flashcard question
- [ ] Can type answer in input field
- [ ] Submitting empty answer shows error "Please enter an answer"
- [ ] Correct answer flips card, shows green ✅ and correct answer
- [ ] Incorrect answer flips card, shows red ❌ and correct answer
- [ ] "Next Card" button appears after answer revealed
- [ ] Clicking "Next Card" advances to next question
- [ ] Progress bar shows current position (e.g., "Card 2 of 15")
- [ ] Reaching end of deck auto-restarts with shuffled cards
- [ ] Refreshing page preserves progress (localStorage)

### User Story 2: Category Filtering ✅
- [ ] Top strip displays category badges (Verbs, Idioms, Adjectives, Advanced)
- [ ] Clicking category activates filter (badge fills with color)
- [ ] Active filter shows only matching cards
- [ ] Progress bar updates to filtered deck size
- [ ] Multiple categories can be active (OR logic)
- [ ] "Clear All" button appears when filters active
- [ ] Empty filter results show "No cards match your criteria"
- [ ] Filters persist after page refresh

### User Story 3: Preview Chips ✅
- [ ] Preview chips appear in corners (desktop ≥1024px only)
- [ ] Left chip shows previous card (truncated)
- [ ] Right chip shows next card (truncated)
- [ ] Clicking chips navigates to that card
- [ ] No left chip on first card
- [ ] No right chip on last card or before answering
- [ ] Preview chips hidden on mobile/tablet

### User Story 4: Sorting ✅
- [ ] Sort dropdown appears in top-right
- [ ] "Random" shuffles cards
- [ ] "Alphabetical" sorts A-Z by question
- [ ] "By Difficulty" sorts 1-5 (easy to hard)
- [ ] "Least Practiced" shows least-seen cards first
- [ ] Sort persists when changing filters
- [ ] Sort method persists after page refresh

### Cross-Story Integration ✅
- [ ] All features work together without conflicts
- [ ] Progress tracking accurate across all features
- [ ] Keyboard navigation works in all scenarios
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1024px+)

## 📊 Data Format

Flashcards are stored in `app/data/flashcards.json`:

```json
{
  "flashcards": [
    {
      "id": "card-001",
      "question": "To seize an opportunity",
      "answer": "Grasp",
      "categories": ["verbs"],
      "difficulty": 2,
      "notes": "Can also mean to understand something"
    }
  ],
  "categories": [
    {
      "id": "verbs",
      "name": "Verbs",
      "color": "#3B82F6",
      "description": "Common English verbs"
    }
  ]
}
```

## 🤝 Contributing

This project follows the DayDayLearn Constitution:
- **Clean Code**: Single responsibility, clear naming
- **Simple UX**: Minimal navigation, binary feedback
- **Responsive Design**: Mobile-first approach
- **Minimal Dependencies**: Uses only Next.js, React, Tailwind
- **No Testing Infrastructure**: Manual validation only

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Repository**: [github.com/Coming98/DayDayLearn](https://github.com/Coming98/DayDayLearn)
- **Documentation**: See `/specs/001-card-learning-ui/` for detailed planning docs

---

Built with ❤️ using Next.js 16, React 19, and Tailwind CSS 4
