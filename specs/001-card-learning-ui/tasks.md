# Tasks: Card-Based English Learning Interface

**Input**: Design documents from `/specs/001-card-learning-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Constitution Compliance**: This template MUST NOT include any testing tasks. Testing infrastructure is explicitly forbidden per the DayDayLearn Constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js app structure**: `app/`, `lib/`, `types/`, `data/` at repository root
- Paths shown below assume Next.js 16.0.1 App Router structure
- Feature-specific pages go in `app/learn/`
- Shared components go in `app/learn/components/`
- Utilities go in `app/lib/`
- Types go in `app/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic directory structure

- [X] T001 Create directory structure: app/learn/, app/learn/components/, app/lib/, app/types/, app/data/, public/icons/
- [X] T002 [P] Add CSS utilities to app/globals.css for card flip animations (perspective-1000, transform-style-preserve-3d, backface-hidden)
- [X] T003 [P] Create app/types/flashcard.ts with TypeScript interfaces (Flashcard, Category, UserProgress, CardStats, SortMethod, LearningSession, SessionProgress)
- [X] T004 [P] Create app/data/flashcards.json with sample flashcard dataset (minimum 10 cards across 4 categories: Verbs, Idioms, Adjectives, Advanced)

**Checkpoint**: Directory structure ready, types defined, sample data available

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utility functions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Implement app/lib/flashcard-data.ts with getFlashcards() and getCategories() functions
- [X] T006 [P] Implement app/lib/storage.ts with loadProgress(), saveProgress(), and clearProgress() functions for localStorage operations
- [X] T007 [P] Implement app/lib/answer-matcher.ts with matchAnswer() function (case-insensitive exact match with whitespace normalization)
- [X] T008 [P] Implement app/lib/card-shuffle.ts with shuffleCards(), sortCards(), and filterCards() functions
- [X] T009 Create app/page.tsx as landing page with "Start Learning" link to /learn route

**Checkpoint**: Foundation ready - all utility functions tested manually via console, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Card Learning Flow (Priority: P1) 🎯 MVP

**Goal**: Enable users to view flashcard questions, type answers, submit them, see binary feedback (✅/❌), and navigate to the next card. This is the fundamental learning flow.

**Independent Validation**: Load app at /learn, see a flashcard question displayed, type an answer in bottom panel, submit (Enter or button), see card flip with green ✅ for correct or red ❌ for incorrect, click "Next Card" to advance, see progress bar update (e.g., "Card 2 of 10").

### Implementation for User Story 1

- [X] T010 [P] [US1] Create app/learn/components/FlashCard.tsx component (displays question/answer sides with CSS flip animation, binary feedback icons)
- [X] T011 [P] [US1] Create app/learn/components/ControlPanel.tsx component (input field, Submit/Next buttons, error message display, keyboard Enter handler)
- [X] T012 [P] [US1] Create app/learn/components/ProgressBar.tsx component (horizontal bar with percentage fill, text overlay showing "Card X of Y")
- [X] T013 [US1] Create app/learn/page.tsx main learning page (state management for currentCardIndex, userAnswer, isFlipped, isCorrect, filteredCards, keyboard navigation, handleSubmit, handleNext, localStorage sync)
- [X] T014 [US1] Implement card flip animation in FlashCard.tsx (rotateY transform, 600ms duration, backface-hidden for both sides)
- [X] T015 [US1] Implement answer validation in app/learn/page.tsx (call matchAnswer(), update isCorrect state, update cardStats in UserProgress)
- [X] T016 [US1] Implement empty answer rejection in ControlPanel.tsx (display "Please enter an answer" error when userAnswer.trim() is empty)
- [X] T017 [US1] Implement session completion auto-restart in app/learn/page.tsx (detect when currentCardIndex reaches filteredCards.length, reset to 0, shuffle cards, clear filters)
- [X] T018 [US1] Add responsive design to FlashCard.tsx (text size adjustments for mobile: text-3xl on mobile, text-5xl on desktop)
- [X] T019 [US1] Add responsive design to ControlPanel.tsx (input panel height: 15vh on mobile, 10vh on desktop; button sizing)

**Checkpoint**: At this point, User Story 1 should be fully functional and manually testable - can complete full learning cycle from question → answer → feedback → next card with progress tracking

---

## Phase 4: User Story 2 - Category & Filter Navigation (Priority: P2)

**Goal**: Enable users to filter flashcards by category/tag (e.g., "Verbs", "Idioms") to focus on specific topics, with progress bar reflecting filtered deck size.

**Independent Validation**: Load /learn, click a category tag in top strip (e.g., "Verbs"), observe card deck updates to show only Verbs cards, see progress bar show "Card 1 of X Verbs", click another category to toggle, click "Clear All" to return to full deck.

### Implementation for User Story 2

- [X] T020 [P] [US2] Create app/learn/components/FilterStrip.tsx component (category badges with active/inactive states using category.color, "Clear All" button visible when activeFilters.length > 0)
- [X] T021 [US2] Add FilterStrip.tsx to top of app/learn/page.tsx layout (flex-none h-14 position in full-screen flexbox)
- [X] T022 [US2] Implement filter state management in app/learn/page.tsx (activeFilters array, handleFilterToggle function, handleClearFilters function)
- [X] T023 [US2] Update filteredCards computation in app/learn/page.tsx to use filterCards() from lib/card-shuffle.ts based on activeFilters
- [X] T024 [US2] Implement filter persistence in app/learn/page.tsx (save activeFilters to UserProgress.filters on change, load from localStorage on mount)
- [X] T025 [US2] Reset currentCardIndex to 0 when filters change in app/learn/page.tsx (prevent out-of-bounds index after filtering)
- [X] T026 [US2] Implement empty filter results handling in app/learn/page.tsx (display "No cards match your criteria" message when filteredCards.length === 0)
- [X] T027 [US2] Add horizontal scrolling to FilterStrip.tsx for mobile (overflow-x-auto, flex-wrap on larger screens)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can complete full learning cycle with category filtering active

---

## Phase 5: User Story 3 - Quick Card Preview & Navigation (Priority: P3)

**Goal**: Display small preview chips in top-left and top-right corners of card viewport showing abbreviated content of previous/next cards, allowing direct navigation by clicking chips.

**Independent Validation**: Load /learn, navigate to middle of deck (card 5 of 10), see preview chip in top-left showing previous card's question (truncated), see preview chip in top-right showing next card's question, click left chip to jump to card 4, click right chip to jump to card 6, verify no preview on first card (left) or last card (right).

### Implementation for User Story 3

- [X] T028 [P] [US3] Create app/learn/components/PreviewChip.tsx component (displays truncated question max 30 chars + answer first 20 chars, positioned absolute top-left or top-right, hover scale effect, hidden on lg:hidden mobile/tablet)
- [X] T029 [US3] Add PreviewChip instances to app/learn/page.tsx card viewport area (two instances: position="left" for previous card, position="right" for next card)
- [X] T030 [US3] Implement previousCard and nextCard derivation in app/learn/page.tsx (filteredCards[currentCardIndex - 1] and filteredCards[currentCardIndex + 1], handle null at boundaries)
- [X] T031 [US3] Implement preview chip click handlers in app/learn/page.tsx (navigate to previousCard or nextCard index, reset UI state like handleNext)
- [X] T032 [US3] Hide preview chips at deck boundaries in PreviewChip.tsx (render nothing if card prop is null, or show greyed-out disabled state)
- [X] T033 [US3] Hide next card preview if unanswered in app/learn/page.tsx (check if cardStats[nextCard.id] exists before showing right preview chip)
- [X] T034 [US3] Add responsive visibility to PreviewChip.tsx (hidden class on mobile md:hidden, visible only on lg:block desktop ≥1024px)

**Checkpoint**: All user stories 1, 2, AND 3 should now be independently functional - preview navigation works without breaking core learning or filtering

---

## Phase 6: User Story 4 - Sorting & Organization Controls (Priority: P3)

**Goal**: Allow users to control card presentation order (Random, Alphabetical, By Difficulty, Least Practiced) via dropdown in top control strip.

**Independent Validation**: Load /learn, open sort dropdown in FilterStrip, select "Alphabetical", observe cards reorder A→Z by question text, select "By Difficulty", observe cards reorder easy→hard (1→5), select "Random", observe cards shuffle, verify sort persists when changing filters (alphabetical order maintained within filtered subset).

### Implementation for User Story 4

- [X] T035 [US4] Add sort dropdown to app/learn/components/FilterStrip.tsx (select element with options: Random, Alphabetical, By Difficulty, Least Practiced)
- [X] T036 [US4] Implement sort state management in app/learn/page.tsx (sortMethod state, handleSortChange function)
- [X] T037 [US4] Update filteredCards computation in app/learn/page.tsx to apply sortCards() after filterCards() based on sortMethod
- [X] T038 [US4] Implement sort persistence in app/learn/page.tsx (save sortMethod to UserProgress.sortMethod on change, load from localStorage on mount)
- [X] T039 [US4] Reset currentCardIndex to 0 when sort changes in app/learn/page.tsx (prevent confusion when deck reorders)
- [X] T040 [US4] Implement "Least Practiced" sort option in lib/card-shuffle.ts (sort by cardStats.timesShown ascending, cards with no stats first)
- [X] T041 [US4] Verify sort persists across filter changes in app/learn/page.tsx (when activeFilters change, sortMethod stays the same and applies to new filtered set)

**Checkpoint**: All four user stories should now be independently functional - can learn with any combination of filters and sort methods

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and enhancements that affect multiple user stories or overall UX

- [X] T042 [P] Add keyboard navigation for arrow keys in app/learn/page.tsx (ArrowLeft for previous card, ArrowRight for next card, Escape to clear input)
- [X] T043 [P] Optimize card flip animation performance in app/globals.css (ensure GPU acceleration with will-change: transform)
- [X] T044 [P] Add loading state to app/learn/page.tsx while flashcards.json loads (display "Loading..." centered in viewport)
- [X] T045 [P] Improve error handling in lib/storage.ts (catch QuotaExceededError, log to console, display toast notification to user)
- [X] T046 [P] Add category badge colors to FilterStrip.tsx (use category.color for active badge background, ensure text contrast with white text)
- [X] T047 [P] Polish card styling in FlashCard.tsx (add shadow-2xl, rounded-2xl, smooth transitions for all state changes)
- [X] T048 [P] Add focus states to ControlPanel.tsx input and buttons (ring-2 ring-blue-500 on focus for accessibility)
- [X] T049 [P] Optimize mobile responsiveness across all components (test on 375px, 768px, 1024px breakpoints, adjust spacing/sizing)
- [X] T050 [P] Add card notes display to FlashCard.tsx answer side (show card.notes if present, smaller italic text at bottom)
- [X] T051 Update README.md with feature description, how to run locally (npm run dev), and manual testing instructions
- [X] T052 Manual cross-browser testing (Chrome, Firefox, Safari) to validate CSS flip animation and localStorage persistence
- [X] T053 Manual performance validation (measure card flip animation duration <100ms, filter/sort operations <50ms, initial load <2s on throttled 3G)

**Checkpoint**: Application is polished, performant, and ready for deployment - all user stories work together seamlessly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (needs types and data structure) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - Core learning flow is MVP
- **User Story 2 (Phase 4)**: Depends on Foundational + User Story 1 completion - Adds filtering on top of core flow
- **User Story 3 (Phase 5)**: Depends on Foundational + User Story 1 completion - Preview navigation enhances core flow (can be parallel with US2)
- **User Story 4 (Phase 6)**: Depends on Foundational + User Story 1 completion - Sorting enhances core flow (can be parallel with US2/US3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - **No dependencies on other stories** - MVP complete after this
- **User Story 2 (P2)**: Can start after User Story 1 - Builds on existing FilterStrip integration but maintains independent validation
- **User Story 3 (P3)**: Can start after User Story 1 - Independent feature, can run parallel with US2/US4
- **User Story 4 (P3)**: Can start after User Story 1 - Independent feature, can run parallel with US2/US3

### Within Each User Story

**User Story 1 (Core Flow)**:
- T010-T012 (components) can run in parallel
- T013 (main page) depends on T010-T012 completion
- T014-T019 can run in parallel after T013

**User Story 2 (Filtering)**:
- T020 (FilterStrip component) is independent
- T021-T027 depend on T020 completion

**User Story 3 (Preview)**:
- T028 (PreviewChip component) is independent  
- T029-T034 depend on T028 completion

**User Story 4 (Sorting)**:
- T035 (dropdown in FilterStrip) builds on US2
- T036-T041 can proceed sequentially

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004 can all run in parallel (different files)
- **Phase 2 (Foundational)**: T005, T006, T007, T008 can all run in parallel (different lib/ files)
- **Phase 3 (US1)**: T010, T011, T012 can run in parallel (different components)
- **After MVP (US1 complete)**: User Stories 2, 3, 4 can all start in parallel if team capacity allows (independent features)
- **Phase 7 (Polish)**: Most tasks marked [P] can run in parallel (different concerns)

---

## Parallel Example: User Story 1 (MVP)

```bash
# After Foundational phase is complete, launch all US1 components together:

# Terminal 1 - Component Developer A:
Task: "Create FlashCard.tsx component with flip animation"

# Terminal 2 - Component Developer B:  
Task: "Create ControlPanel.tsx component with input and buttons"

# Terminal 3 - Component Developer C:
Task: "Create ProgressBar.tsx component with progress display"

# Then integrate (single developer or lead):
Task: "Create main learn/page.tsx with state management and orchestration"

# Then polish in parallel:
Task: "Add responsive design to FlashCard"
Task: "Add responsive design to ControlPanel"
Task: "Implement answer validation logic"
```

---

## Parallel Example: After MVP (User Stories 2, 3, 4)

```bash
# Once US1 (MVP) is complete, three developers can work in parallel:

# Developer A - User Story 2 (Filtering):
Task: "Create FilterStrip component"
Task: "Integrate filtering into main page"

# Developer B - User Story 3 (Preview):
Task: "Create PreviewChip component"  
Task: "Add preview navigation to main page"

# Developer C - User Story 4 (Sorting):
Task: "Add sort dropdown to FilterStrip"
Task: "Implement sort state management"

# All three stories integrate independently and don't block each other
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

1. Complete Phase 1: Setup (~30 min)
2. Complete Phase 2: Foundational (~45 min)
3. Complete Phase 3: User Story 1 (~2.5 hours)
4. **STOP and VALIDATE**: Manually test core learning flow independently
   - Can you see a flashcard question?
   - Can you type an answer and submit it?
   - Does the card flip with correct ✅/❌ feedback?
   - Can you navigate to the next card?
   - Does progress bar update correctly?
   - Does progress persist after page refresh?
5. **DEPLOY/DEMO MVP**: Core learning flow is now usable!

**Total MVP Time**: ~3.5-4 hours

### Incremental Delivery (Add Stories One by One)

1. Complete Setup + Foundational → Foundation ready (~1.25 hours)
2. Add User Story 1 → Manually validate independently → **Deploy/Demo MVP** (~2.5 hours)
3. Add User Story 2 → Manually validate filtering → **Deploy/Demo** (~1.5 hours)
4. Add User Story 3 → Manually validate preview navigation → **Deploy/Demo** (~1 hour)
5. Add User Story 4 → Manually validate sorting → **Deploy/Demo** (~1 hour)
6. Polish phase → Final manual validation → **Final Deploy** (~1.5 hours)

**Total Time**: ~8.5-9 hours (all features)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 3+ developers:

1. **All devs together**: Complete Setup + Foundational (~1.25 hours)
2. **Parallel development** after Foundational:
   - Developer A: User Story 1 components (T010-T012)
   - Developer B: Main page integration (T013)
   - Developer C: US1 polish and validation (T014-T019)
3. **After US1 (MVP) complete**:
   - Developer A: User Story 2 (Filtering)
   - Developer B: User Story 3 (Preview)
   - Developer C: User Story 4 (Sorting)
4. **Final integration**: All devs test together, polish phase

**Total Time with 3 devs**: ~4-5 hours to complete all features

---

## Task Summary

**Total Tasks**: 53 tasks across 7 phases

**Task Count by Phase**:
- Phase 1 (Setup): 4 tasks (~30 min)
- Phase 2 (Foundational): 5 tasks (~45 min)
- Phase 3 (US1 - Core Flow): 10 tasks (~2.5 hours) - **MVP**
- Phase 4 (US2 - Filtering): 8 tasks (~1.5 hours)
- Phase 5 (US3 - Preview): 7 tasks (~1 hour)
- Phase 6 (US4 - Sorting): 7 tasks (~1 hour)
- Phase 7 (Polish): 12 tasks (~1.5 hours)

**Parallelizable Tasks**: 21 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- **US1**: Complete learning cycle works (question → answer → feedback → next → progress tracking)
- **US2**: Category filtering works and updates deck size in progress bar
- **US3**: Preview chips display adjacent cards and enable direct navigation
- **US4**: Sort dropdown changes card order and persists across filter changes

**Suggested MVP Scope**: User Story 1 only (19 tasks, ~4 hours total including setup)

**Full Feature Scope**: All 4 user stories (53 tasks, ~8.5-9 hours solo, ~4-5 hours with 3 devs)

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] labels**: Map tasks to user stories for traceability and independent delivery
- **Each user story**: Independently completable and manually validatable without other stories
- **Manual validation**: Replaces automated testing per constitution - use acceptance scenarios from spec.md
- **Commit strategy**: Commit after each task or logical group of related tasks
- **Checkpoints**: Stop at any checkpoint to manually validate story works independently
- **Constitution compliance**: Zero testing infrastructure - all quality assurance through manual validation
- **Technology constraints**: Uses only Next.js 16.0.1, React 19.2.0, Tailwind CSS 4.x - no additional dependencies

---

## Validation Checklist (Manual Testing)

Use this checklist after completing each user story to validate functionality:

### User Story 1 (Core Flow) - MVP Validation
- [ ] Page loads and displays first flashcard question in center
- [ ] Input panel is visible at bottom (10% height)
- [ ] Can type answer in input field
- [ ] Submitting empty answer shows error "Please enter an answer"
- [ ] Submitting correct answer flips card, shows green ✅ and correct answer
- [ ] Submitting incorrect answer flips card, shows red ❌ and correct answer
- [ ] "Next Card" button appears after answer revealed
- [ ] Clicking "Next Card" advances to next question
- [ ] Progress bar shows current position (e.g., "Card 2 of 10")
- [ ] Reaching end of deck auto-restarts with shuffled cards
- [ ] Refreshing page preserves current card position (localStorage)

### User Story 2 (Filtering) - Independent Validation
- [ ] Top strip displays all category badges (Verbs, Idioms, Adjectives, etc.)
- [ ] Clicking category badge activates it (fills with category color)
- [ ] Active filter shows only matching cards
- [ ] Progress bar updates to show filtered deck size (e.g., "Card 1 of 5")
- [ ] Multiple categories can be active (OR logic)
- [ ] "Clear All" button appears when filters active
- [ ] Clicking "Clear All" returns to full deck
- [ ] Filters persist after page refresh (localStorage)
- [ ] Empty filter results show "No cards match your criteria"

### User Story 3 (Preview) - Independent Validation
- [ ] Preview chips appear in top-left and top-right corners (desktop only)
- [ ] Left chip shows previous card's question (truncated)
- [ ] Right chip shows next card's question (truncated)
- [ ] Clicking left chip navigates to previous card
- [ ] Clicking right chip navigates to next card
- [ ] No left chip on first card
- [ ] No right chip on last card
- [ ] Preview chips hidden on mobile/tablet (< 1024px)
- [ ] Hover effect scales chip slightly (1.05x)

### User Story 4 (Sorting) - Independent Validation
- [ ] Sort dropdown appears in top strip with options
- [ ] "Random" shuffles cards
- [ ] "Alphabetical" sorts A→Z by question text
- [ ] "By Difficulty" sorts 1→5 (easy to hard)
- [ ] Sort persists when changing filters (sorted within filtered set)
- [ ] Sort method persists after page refresh (localStorage)
- [ ] Current card resets to first when sort changes

### Cross-Story Integration Validation
- [ ] All features work together without conflicts
- [ ] Filtering + Sorting works correctly
- [ ] Preview chips update when filters change
- [ ] Progress tracking accurate across all features
- [ ] localStorage saves all state (position, filters, sort, card stats)
- [ ] Performance: Card flip < 100ms, filter/sort < 50ms, load < 2s

### Responsive Design Validation
- [ ] Mobile (375px): Layout stacks properly, input panel 15vh, no preview chips
- [ ] Tablet (768px): Balanced layout, input panel 10vh
- [ ] Desktop (1024px+): Optimal spacing, preview chips visible, max-w-3xl card
- [ ] All text readable at all sizes
- [ ] Touch targets ≥44px on mobile
- [ ] Horizontal scrolling works on filter strip (mobile)

### Browser Compatibility Validation
- [ ] Chrome: Card flip animation smooth
- [ ] Firefox: localStorage persistence works
- [ ] Safari: CSS transforms render correctly
- [ ] All browsers: Consistent visual appearance

---

**Ready to Start Implementation!** Begin with Phase 1 (Setup) and work through phases in order. MVP can be delivered after Phase 3 (User Story 1).
