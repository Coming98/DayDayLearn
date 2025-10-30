<!--
Sync Impact Report:
- Version change: Template → 1.0.0 (Initial constitution)
- Added principles: Clean Code, Simple UX, Responsive Design, Minimal Dependencies, No Testing
- Added sections: Technology Stack Requirements, Development Standards
- Templates requiring updates: ⚠ plan-template.md, ⚠ spec-template.md, ⚠ tasks-template.md (removing test references)
- Follow-up TODOs: None - all placeholders filled
-->

# DayDayLearn Constitution

## Core Principles

### I. Clean Code (NON-NEGOTIABLE)
Code MUST be readable, maintainable, and self-documenting. Every component MUST have a single, clear responsibility. Functions MUST be small and focused. Variable and function names MUST clearly express intent. Code complexity MUST be justified against business value.

**Rationale**: Clean code reduces cognitive load, enables faster feature development, and minimizes debugging time, which is critical for rapid iteration in a learning platform.

### II. Simple UX
User interfaces MUST prioritize simplicity and clarity over feature richness. Every UI element MUST serve a clear purpose in the user's learning journey. Navigation MUST be intuitive and require minimal explanation. User flows MUST be optimized for the shortest path to value.

**Rationale**: Learning platforms succeed when users can focus on content rather than interface complexity. Cognitive overhead from poor UX directly impedes learning effectiveness.

### III. Responsive Design
All interfaces MUST work seamlessly across mobile, tablet, and desktop devices. Design MUST be mobile-first with progressive enhancement. Touch targets MUST meet accessibility standards. Content MUST be readable without horizontal scrolling on any supported screen size.

**Rationale**: Modern learners access content across multiple devices. A broken mobile experience creates barriers to consistent learning habits.

### IV. Minimal Dependencies
External dependencies MUST be justified by significant value delivery. Each dependency MUST be evaluated for maintenance burden, security implications, and bundle size impact. Prefer native browser APIs and platform capabilities over third-party libraries when feasible.

**Rationale**: Dependencies introduce maintenance debt, security vulnerabilities, and performance overhead. Minimal dependencies reduce the attack surface and improve long-term maintainability.

### V. No Testing (SUPERSEDES ALL OTHER GUIDANCE)
This project MUST NOT include any form of automated testing. No unit tests, integration tests, end-to-end tests, or test frameworks MUST be included. Testing infrastructure and test-related dependencies are explicitly forbidden. Manual testing and user feedback are the sole quality assurance methods.

**Rationale**: For rapid prototyping and learning platforms where speed of iteration is paramount, testing overhead can impede experimental development and feature discovery.

## Technology Stack Requirements

**Framework Stack**: MUST use Next.js 16.0.1, React 19.2.0, and Tailwind CSS 4.x as specified in package.json. Version updates MUST be deliberate decisions with documented rationale.

**Development Environment**: TypeScript MUST be used for type safety. ESLint MUST be configured for code quality. Package management MUST use npm as the primary tool.

**Performance Standards**: Pages MUST load within 2 seconds on 3G connections. Bundle size MUST be monitored and justified. Core Web Vitals MUST meet "Good" thresholds.

## Development Standards

**Code Organization**: Components MUST be organized by feature area within the app directory structure. Shared utilities MUST be clearly separated from feature-specific code.

**Commit Standards**: Commits MUST follow conventional commit format. Each commit MUST represent a single logical change. Breaking changes MUST be clearly documented.

**Deployment**: Production deployments MUST be through Vercel platform as documented in README.md. Local development MUST use `npm run dev` as the standard workflow.

## Governance

This constitution SUPERSEDES all other development practices and guidance documents. Any conflicts between this constitution and other templates or documentation MUST be resolved in favor of the constitution.

Amendments require explicit documentation of rationale, impact assessment, and version increment. All project contributors MUST verify compliance with these principles during development and review processes.

The NO TESTING principle takes absolute precedence over any other guidance that suggests or requires testing infrastructure, test files, or test-driven development practices.

**Version**: 1.0.0 | **Ratified**: 2025-10-29 | **Last Amended**: 2025-10-29
