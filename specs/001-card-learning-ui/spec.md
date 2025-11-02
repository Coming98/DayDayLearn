# Feature Specification: Card-Based English Learning Interface

**Feature Branch**: `001-card-learning-ui`  
**Created**: November 1, 2025  
**Status**: Ready for Planning  
**Input**: User description: "I'd like to create a card-based english learning website, the layout could be: 1. Center: Card viewport (dominant) to display question or answer or notes ... 2. Top strip: Category/Tag selectors, Filter & Sort controls., small tool bars 3. Bottom 10%: Control Panel, the input area, people type here to input anwer 4. Between Card & Panel: Compact Progress bar (current face index in cycle). 5. Top‑left & Top‑right over Card: Previous/Next Card preview chips (show Q & A)."

## Clarifications

### Session 2025-11-01

- Q: What level of detail should the answer validation feedback provide? → A: Binary only (green checkmark for correct, red X for incorrect)
- Q: What happens when a user completes all cards in the current session (reaches 100% progress)? → A: Auto-restart with cards shuffled in random order and all filters cleared
- Q: What authentication approach should be used for cross-session persistence? → A: No authentication required, use browser fingerprinting or localStorage only (anonymous users)
- Q: What happens if the user tries to submit an empty answer? → A: Reject submission with error message ("Please enter an answer")
- Q: How should card data be sourced and managed? → A: Bundled static JSON file

## User Scenarios & Manual Validation *(mandatory)*

### User Story 1 - Core Card Learning Flow (Priority: P1)

A learner opens the application and interacts with vocabulary flashcards by viewing questions, typing answers, and navigating through cards to practice English vocabulary and phrases.

**Why this priority**: This is the fundamental value proposition - enabling users to learn through interactive flashcards. Without this, the application serves no purpose.

**Independent Validation**: Can be fully validated by loading the app, viewing a card question, typing an answer, submitting it, seeing the answer revealed and related notes, and navigating to the next card. Delivers immediate learning value.

**Acceptance Scenarios**:

1. **Given** a user opens the learning interface, **When** the page loads, **Then** a flashcard displays prominently in the center showing a question (e.g., word to translate, definition to match)
2. **Given** a question is displayed, **When** the user types their answer in the bottom input panel, **Then** the text appears in real-time in the input field
3. **Given** the user has typed an answer, **When** they submit (press Enter or click Submit), **Then** the card flips or transitions to show the correct answer with visual feedback indicating correctness
4. **Given** an answer is revealed, **When** the user navigates to the next card, **Then** the current card exits and the next card appears with a new question
5. **Given** multiple cards in the learning session, **When** the user is on any card, **Then** the progress bar shows current position (e.g., "Card 15 of 50")

---

### User Story 2 - Category & Filter Navigation (Priority: P2)

A learner wants to focus on specific vocabulary topics (e.g., business English, travel phrases) and can select categories/tags or apply filters to customize their learning session.

**Why this priority**: Targeted learning is significantly more effective than random practice. This enables users to focus on areas they need most.

**Independent Validation**: Can be manually validated by selecting different category tags in the top strip and observing the card deck updating to show only cards from that category. Delivers value by enabling focused practice sessions.

**Acceptance Scenarios**:

1. **Given** the user is on the main interface, **When** they view the top strip, **Then** they see selectable category/tag options (e.g., "Verbs", "Idioms", "Adjectives", "Business")
2. **Given** available categories are displayed, **When** the user clicks a category tag, **Then** only cards matching that category are included in the learning session and the first card loads
3. **Given** cards are displayed, **When** the user applies a filter (e.g., "Not yet mastered", "Difficult words"), **Then** the card deck refreshes to show only matching cards
4. **Given** the user has selected filters, **When** they view the progress bar, **Then** it shows the count of filtered cards (e.g., "Card 5 of 23 matching filters")

---

### User Story 3 - Quick Card Preview & Navigation (Priority: P3)

A learner wants to quickly preview adjacent cards (previous and next) without fully navigating away from the current card, allowing them to see what's coming or review what they just completed.

**Why this priority**: Enhances user experience by providing context and reducing surprise. Useful for advanced learners who want to see upcoming content, but not essential for basic learning functionality.

**Independent Validation**: Can be validated by viewing the top-left and top-right preview chips overlaying the card viewport, clicking them to jump directly to those cards, and confirming they display abbreviated question/answer content. Delivers convenience value.

**Acceptance Scenarios**:

1. **Given** the user is viewing a card in the middle of a session, **When** they look at the top-left corner of the card viewport, **Then** they see a small preview chip showing the previous card's question and answer.
2. **Given** preview chips are visible, **When** the user hovers over a preview chip, **Then** it highlights to indicate interactivity.
3. **Given** a preview chip is displayed, **When** the user clicks it, **Then** they navigate directly to that card (previous or next).
4. **Given** the user is on the first card, **When** they check the top-left position, **Then** no previous card preview appears (or it shows as disabled).
5. **Given** the next card in sequence has not yet been answered by the user, **When** the current card is displayed, **Then** the top-right preview is hidden or shown as disabled (no preview of unanswered next cards).
6. **Given** the user is on the last card, **When** they check the top-right position, **Then** no next card preview appears (or it shows as disabled).

---

### User Story 4 - Sorting & Organization Controls (Priority: P3)

A learner wants to control the order in which cards are presented (e.g., alphabetical, by difficulty, random, by progress) to customize their learning strategy.

**Why this priority**: Personalization of learning paths enhances engagement but is not critical for initial value delivery. Users can learn effectively with default ordering.

**Independent Validation**: Can be validated by selecting different sort options in the top control strip and confirming the card order changes accordingly. Delivers value by accommodating different learning preferences.

**Acceptance Scenarios**:

1. **Given** the user opens the sort controls in the top strip, **When** they view available options, **Then** they see sort choices (e.g., "Random", "Alphabetical", "By Difficulty", "Least Practiced")
2. **Given** sort options are available, **When** the user selects a sort method, **Then** the card deck reorders immediately and the first card in the new order displays
3. **Given** cards are sorted, **When** the user navigates through cards, **Then** they appear in the selected sort order
4. **Given** a sort method is active, **When** the user changes categories/filters, **Then** the sort order persists and applies to the new filtered set

---

### Edge Cases

- What happens when a user has completed all cards in the current session (reaches 100% progress)? → System automatically restarts the session with all cards shuffled in random order and all filters/category selections cleared, returning to the full deck.
- How does the system handle when no cards match selected filters/categories (empty deck)?
- What happens if the user navigates backward from the first card or forward from the last card?
- How does the input panel behave when the card is showing an answer (should it be disabled or reset)?
- What happens if the user tries to submit an empty answer? → System rejects the submission and displays an error message ("Please enter an answer") without advancing the card or revealing the answer.
- How does the system handle very long answers that exceed input field capacity?
- What happens when cards contain special characters, non-Latin scripts, or multimedia content in questions/answers?
- How does the interface adapt to mobile/tablet screen sizes where a 10% bottom panel might be too small?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a single flashcard prominently in the center viewport occupying the dominant screen area (at least 60% of viewport height)
- **FR-001a**: System MUST load flashcard data from a bundled static JSON file at application startup
- **FR-002**: System MUST show the current card's question state by default when a card loads
- **FR-003**: System MUST provide an input area in the bottom 10% of the viewport where users can type their answers
- **FR-004**: Users MUST be able to submit their answer via Enter key or a Submit button
- **FR-004a**: System MUST reject empty answer submissions and display an error message ("Please enter an answer") without advancing or revealing the correct answer
- **FR-005**: System MUST reveal the correct answer after submission, with binary visual feedback (green checkmark for correct, red X for incorrect) indicating match result
- **FR-006**: System MUST provide navigation controls to move to the next card after answer is revealed
- **FR-007**: System MUST display a compact progress bar between the card viewport and the bottom control panel showing current card index and total count (e.g., "15 / 50")
- **FR-008**: System MUST display category/tag selectors in a top strip to filter card decks by topic
- **FR-009**: System MUST provide filter controls in the top strip to subset cards by criteria (e.g., mastery level, difficulty)
- **FR-010**: System MUST provide sort controls in the top strip to reorder cards by different methods (e.g., random, alphabetical, difficulty)
- **FR-011**: System MUST display small preview chips in the top-left and top-right positions over the card viewport showing abbreviated content of previous and next cards (if next cards have been answered)
- **FR-012**: Preview chips MUST show question (Q) text for the adjacent cards
- **FR-013**: Users MUST be able to click preview chips to navigate directly to those cards
- **FR-014**: System MUST disable or hide the previous card preview when on the first card
- **FR-015**: System MUST disable or hide the next card preview when on the last card
- **FR-016**: System MUST disable or hide the next card preview when next card has not been answered
- **FR-017**: System MUST update the progress bar whenever the user navigates to a different card
- **FR-018**: System MUST persist the user's current position, selected filters, and sort order across browser sessions using browser localStorage, allowing anonymous users to resume exactly where they left off even after closing and reopening the browser (limited to same browser/device)
- **FR-019**: System MUST handle empty filter results by displaying a "No cards match your criteria" message
- **FR-020**: System MUST reset the input field when navigating to a new card
- **FR-021**: System MUST support keyboard navigation (e.g., arrow keys for next/previous, Enter to submit)
- **FR-022**: System MUST automatically restart the session when all cards are completed (100% progress), shuffling all cards in random order and clearing all active filters/category selections to return to the full deck

### Key Entities

- **Flashcard**: Represents a single learning item with a question side (e.g., English word, definition prompt) and an answer side (e.g., translation, correct definition). Contains metadata such as category/tags, difficulty level, and user progress metrics (times shown, times correct).

- **Category/Tag**: Represents a topical grouping for flashcards (e.g., "Verbs", "Idioms", "Business English"). Each flashcard can belong to one or multiple categories.

- **Learning Session**: Represents the current active set of cards the user is working through, including the selected filters, sort order, current card index, and session progress.

- **User Progress**: Tracks individual user interaction with each flashcard including number of times seen, correctness rate, last review date, and mastery level.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a full flashcard review cycle (view question, type answer, see result, navigate) in under 10 seconds per card on average
- **SC-002**: Users can navigate through at least 50 cards in a single session without UI performance degradation or lag
- **SC-003**: 90% of users successfully complete their first flashcard interaction (view, answer, navigate) without confusion or assistance
- **SC-004**: Users can filter and load a new category-specific card deck in under 2 seconds
- **SC-005**: The interface adapts to different screen sizes (desktop, tablet, mobile) while maintaining the core layout structure and usability
- **SC-006**: Preview chips display adjacent card content clearly enough for users to identify them without needing to navigate away from the current card
- **SC-007**: Progress bar accurately reflects user position within the filtered/sorted card deck at all times
- **SC-008**: Users can complete a 20-card practice session with less than 5% error rate in navigation (accidental clicks, confusion about controls)

## Assumptions

- Users are learning English vocabulary and phrases (not other subjects or languages, though the system could be adapted)
- Flashcards contain primarily text content; multimedia (images, audio) is not required for the initial version
- Answer validation will use simple string matching (exact match or case-insensitive comparison) rather than AI-powered semantic matching
- Card data is provided as a bundled static JSON file deployed with the application, containing a pre-populated set of English learning flashcards organized by standard categories (Verbs, Idioms, Adjectives, etc.)
- Session progress (current card position, filters, sort order) persists across browser sessions using browser localStorage or similar client-side storage, enabling users to continue learning across different days/sessions on the same browser
- No user authentication is required; all users are anonymous and progress is tied to the browser instance via localStorage or browser fingerprinting
- The application targets desktop and tablet users primarily; mobile optimization is considered but not the primary use case
- Users interact with one card at a time (no multi-card comparison views)
- Sort and filter operations happen client-side for performance (card data is loaded upfront from the static JSON file)
