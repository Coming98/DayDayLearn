# Feature Specification: QANC Learning System

**Feature Branch**: `001-qanc-learning-system`  
**Created**: 2025-10-31  
**Status**: Draft  
**Input**: User description: "Query Answer Notes Card (QANC) — A minimalist, single-screen card-based learning system that helps learners capture atomic knowledge and review it efficiently through a focused, keyboard-first experience."

## Clarifications

### Session 2025-10-31

- Q: Which spaced repetition interval progression should be used for scheduling reviews? → A: Ebbinghaus Curve (Approx.)
- Q: Where should card data and review history be stored? → A: Browser local storage only (offline-first, no server required)
- Q: What level of voice input support should be implemented? → A: text only for now
- Q: What should be the maximum file size limit for media attachments? → A: 5MB per file
- Q: Which keyboard shortcuts are absolutely essential for the MVP? → A: no keyboard shortcut for MVP

## User Scenarios & Manual Validation *(mandatory)*

### User Story 1 - Create and Edit Cards (Priority: P1)

As a learner, I want to create atomic knowledge cards with a unique question, single authoritative answer, and optional notes so that I can capture and organize discrete learning concepts efficiently.

**Why this priority**: This is the foundational capability that enables all other features. Without the ability to create cards, there's no content to review or organize.

**Independent Validation**: Can be fully validated by creating a new card with Q/A content, adding notes, and verifying the card is saved and displayable.

**Acceptance Scenarios**:

1. **Given** I'm on the card creation screen, **When** I enter a unique question and answer, **Then** the system creates a new card and confirms the Q uniqueness constraint
2. **Given** I have a card with basic Q/A content, **When** I add multiple notes with text and optional media, **Then** the notes are attached to the card without affecting the core Q/A structure
3. **Given** I attempt to create a card with a duplicate question, **When** I try to save it, **Then** the system prevents creation and suggests editing the existing card
4. **Given** I'm editing an existing card, **When** I update the question, answer, or notes, **Then** the changes are saved and the updated timestamp is recorded

---

### User Story 2 - Review Cards with Spaced Repetition (Priority: P2)

As a learner, I want to review due cards in a structured Q→A→Notes flow with pass/fail grading so that I can reinforce my knowledge through active recall and spaced repetition.

**Why this priority**: This is the core learning functionality that transforms static cards into an active learning system. Essential for the product's value proposition.

**Independent Validation**: Can be manually validated by reviewing a set of cards, providing responses to questions, grading performance, and verifying that review intervals adjust based on results.

**Acceptance Scenarios**:

1. **Given** I have cards due for review, **When** I start a review session, **Then** the system presents cards one by one in Q→A→Notes→(loop) format
2. **Given** I'm viewing a question, **When** I submit my response (text or voice), **Then** the system records my attempt and reveals the authoritative answer
3. **Given** I'm viewing the answer after my response, **When** I grade myself as pass or fail, **Then** the system updates the card's statistics and schedules the next review
4. **Given** I'm in a review session, **When** I navigate through card faces, **Then** the progress indicator shows my current position in the face cycle

---

### User Story 3 - Organize and Filter Cards (Priority: P3)

As a learner, I want to assign categories and tags to cards and filter my deck by various criteria so that I can focus my study sessions on specific topics or review needs.

**Why this priority**: This enhances the learning experience by allowing targeted study but isn't essential for basic functionality.

**Independent Validation**: Can be manually validated by creating categories and tags, assigning them to cards, and applying filters to verify the correct subset of cards is displayed.

**Acceptance Scenarios**:

1. **Given** I'm creating or editing a card, **When** I assign a category and multiple tags, **Then** the organizational metadata is saved with the card
2. **Given** I'm on the main card view, **When** I apply filters by category, review status, or score range, **Then** only cards matching the criteria are displayed
3. **Given** I want to study specific content, **When** I sort cards by score, creation date, or importance, **Then** the cards are reordered according to the selected criteria
4. **Given** I'm creating organizational metadata, **When** I add new categories or tags inline, **Then** they become available for future card organization

---

### Edge Cases

- What happens when a user tries to create a card with only media and no text for Q or A?
- How does the system handle review scheduling when a user consistently fails the same card?
- What occurs when a user attempts to delete their only card in a category?
- How does the system respond when text input is required but user attempts alternative input methods?
- What happens when a user navigates away during card creation without saving?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST enforce unique questions across all cards and prevent duplicate Q creation
- **FR-002**: System MUST allow each card to contain exactly one Q and one A, both requiring text content
- **FR-003**: System MUST support optional single media element (image, audio, or video up to 5MB) per card face alongside text
- **FR-004**: System MUST allow multiple Notes per card, each containing text and/or single media element (up to 5MB)
- **FR-005**: System MUST implement fixed review flow: Q → A → N(1) → N(2) → ... → A → N(1) → ... (loop)
- **FR-006**: System MUST record user text responses to questions before revealing answers
- **FR-007**: System MUST accept binary pass/fail grades and update card statistics accordingly
- **FR-008**: System MUST schedule next review times using Ebbinghaus forgetting curve approximation with intervals based on pass/fail results
- **FR-009**: System MUST assign exactly one Category per card and support multiple Tags per card
- **FR-010**: System MUST provide filtering by Category, review status, score ranges, and importance levels
- **FR-011**: System MUST support sorting by average score, creation time, recent activity, and user-marked importance
- **FR-012**: System MUST operate within a single screen without vertical or horizontal scrolling
- **FR-013**: System MUST provide intuitive mouse/touch interface with clear navigation controls
- **FR-014**: System MUST display progress indicator during review sessions
- **FR-015**: System MUST show preview chips for previous/next cards during navigation
- **FR-016**: System MUST track card metrics including creation time, last tested time, average score, and review counts
- **FR-017**: System MUST provide immediate feedback for constraint violations during card creation/editing
- **FR-018**: System MUST support user-marked importance ratings from 1-5 for each card
- **FR-019**: System MUST allow updating and deleting of existing cards
- **FR-020**: System MUST persist all card data and review history in browser local storage for offline-first operation across sessions

### Key Entities

- **Card**: Represents an atomic learning unit containing one question, one answer, and zero or more notes, plus organizational and performance metadata
- **Face**: Represents a visible side of a card during review (Q, A, or individual Note) with content elements
- **Element**: Represents content within a face (text element required for Q/A, optional media element)
- **Category**: Represents a single organizational label assigned to each card
- **Tag**: Represents additional organizational labels for cards (multiple per card)
- **Review Event**: Represents a single review session result with grade and optional user response
- **Media Item**: Represents attached image, audio, or video content for card faces

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new card with Q, A, and notes in under 90 seconds
- **SC-002**: Users can complete review of 10 cards in under 5 minutes including response time
- **SC-003**: 90% of card creation attempts result in successful save without validation errors
- **SC-004**: Users can navigate the entire interface using standard mouse/touch interactions for 100% of operations
- **SC-005**: Review sessions load and display cards within 2 seconds of user interaction
- **SC-006**: System maintains review schedule accuracy with less than 1-day deviation from optimal intervals
- **SC-007**: Users can filter and find specific cards within 3 clicks or touch interactions
- **SC-008**: Interface remains fully functional on screen sizes from 1024x768 to 4K displays without scrolling
