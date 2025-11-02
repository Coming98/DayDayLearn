---

description: "Task list template for feature implementation"
---

# Tasks: QANC Learning System

**Input**: Design documents from `/specs/001-qanc-learning-system/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Constitution Compliance**: This template MUST NOT include any testing tasks. Testing infrastructure is explicitly forbidden per the DayDayLearn Constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js app structure**: `app/`, `components/`, `lib/` at repository root
- Feature-specific pages go in `app/[feature]/`
- Shared components go in `app/components/` or `components/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js app directory structure per implementation plan
- [x] T002 Initialize TypeScript configuration and dependencies
- [x] T003 [P] Configure ESLint and code formatting tools
- [x] T004 [P] Setup Tailwind CSS configuration and base styles in app/globals.css
- [x] T005 [P] Install and configure Zustand state management dependency
- [x] T006 [P] Create TypeScript type definitions in types/card.ts
- [x] T007 [P] Create TypeScript type definitions in types/review.ts
- [x] T008 [P] Create TypeScript type definitions in types/storage.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks for Next.js applications:

### Phase 2: Foundational Infrastructure (T009-T018)

- [x] **T009**: Setup root layout with responsive design framework
- [x] **T010**: Implement localStorage repository base class
- [x] **T011**: Create schema migration system
- [x] **T012**: Implement Ebbinghaus spaced repetition algorithm
- [x] **T013**: Create card validation rules
- [x] **T014**: Build Button component with variants
- [x] **T015**: Build Input component with validation states
- [x] **T016**: Build Select component
- [x] **T017**: Build ProgressIndicator component
- [x] **T018**: Setup error handling and user feedback system

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and Edit Cards (Priority: P1) 🎯 MVP

**Goal**: Enable users to create atomic knowledge cards with Q/A/Notes structure and manage them

**Independent Validation**: Create a new card with Q/A content, add notes, verify card is saved and displayable

### Implementation for User Story 1

- [x] T019 [P] [US1] Create Card entity store in lib/store/cards.ts
- [x] T020 [P] [US1] Create UI state store in lib/store/ui.ts
- [x] T021 [US1] Implement card service layer with CRUD operations in lib/services/card-service.ts (depends on T019, T020)
- [x] T022 [P] [US1] Create CardView display component in app/components/card/CardView.tsx
- [x] T023 [P] [US1] Create FaceQ component for question display in app/components/card/FaceQ.tsx
- [x] T024 [P] [US1] Create FaceA component for answer display in app/components/card/FaceA.tsx
- [x] T025 [P] [US1] Create FaceNote component for note display in app/components/card/FaceNote.tsx
- [x] T026 [P] [US1] Create MediaElement component for media attachments in app/components/card/MediaElement.tsx
- [x] T027 [US1] Implement card creation page in app/create/page.tsx
- [x] T028 [US1] Add unique question validation and duplicate prevention
- [x] T029 [US1] Add media attachment handling with 5MB file size limits
- [x] T030 [US1] Add form validation and error feedback for card creation
- [x] T031 [US1] Implement card editing functionality with update timestamps

**Checkpoint**: At this point, User Story 1 should be fully functional and manually testable

---

## Phase 4: User Story 2 - Review Cards with Spaced Repetition (Priority: P2)

**Goal**: Enable structured card review with Q→A→Notes flow and pass/fail grading with scheduling

**Independent Validation**: Review a set of cards, provide responses, grade performance, verify review intervals adjust

### Implementation for User Story 2

- [x] T032 [P] [US2] Create ReviewEvent entity and review session store in lib/store/session.ts
- [x] T033 [P] [US2] Create review service layer with session management in lib/services/review-service.ts
- [ ] T034 [US2] Implement main review page interface in app/page.tsx
- [x] T037 [US2] Add review session management and card queuing logic
- [x] T038 [US2] Implement Q→A→Notes flow with face transitions
- [x] T039 [US2] Add text response input and recording functionality
- [x] T040 [US2] Implement pass/fail grading with card statistics updates
- [x] T041 [US2] Integrate Ebbinghaus curve scheduling for next review dates
- [x] T042 [US2] Add progress indicator display during review sessions

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Organize and Filter Cards (Priority: P3)

**Goal**: Enable card organization via categories and tags with filtering and sorting capabilities

**Independent Validation**: Create categories and tags, assign to cards, apply filters to verify correct subsets displayed

### Implementation for User Story 3

- [ ] T043 [P] [US3] Create Category and Tag entities in lib/store/categories.ts and lib/store/tags.ts
- [ ] T044 [P] [US3] Create organization service layer in lib/services/organization-service.ts
- [ ] T045 [US3] Implement organization management page in app/organize/page.tsx
- [ ] T046 [P] [US3] Create category creation and management UI components
- [ ] T047 [P] [US3] Create tag creation and management UI components
- [ ] T048 [US3] Add category assignment functionality to card creation/editing
- [ ] T049 [US3] Add tag assignment functionality to card creation/editing
- [ ] T050 [US3] Implement filtering by category, review status, and score ranges
- [ ] T051 [US3] Implement sorting by score, creation date, and importance
- [ ] T052 [US3] Add inline category and tag creation during card management
- [ ] T053 [US3] Integrate filters and organization into main review interface

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Documentation updates in README.md
- [ ] T055 Code cleanup and refactoring for clean code principles
- [ ] T056 Performance optimization across all stories  
- [ ] T057 Accessibility improvements and responsive design validation
- [ ] T058 SEO optimization and meta tags
- [ ] T059 Manual user experience testing across devices
- [ ] T060 [P] localStorage quota management and cleanup functionality
- [ ] T061 [P] Error boundary implementation for graceful error handling
- [ ] T062 [P] Loading states and user feedback improvements
- [ ] T063 PWA optimization for offline usage (optional)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Components before pages that use them
- Shared utilities before feature-specific code  
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create CardView display component in app/components/card/CardView.tsx"
Task: "Create FaceQ component for question display in app/components/card/FaceQ.tsx"
Task: "Create FaceA component for answer display in app/components/card/FaceA.tsx"
Task: "Create FaceNote component for note display in app/components/card/FaceNote.tsx"
Task: "Create MediaElement component for media attachments in app/components/card/MediaElement.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Manually test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Manually validate independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Manually validate independently → Deploy/Demo
4. Add User Story 3 → Manually validate independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently (manual validation)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability  
- Each user story should be independently completable and manually validatable
- Manual validation replaces automated testing per constitution
- Commit after each task or logical group
- Stop at any checkpoint to manually validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence