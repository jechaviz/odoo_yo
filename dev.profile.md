# Developer Profile: Jesus Chavez (Execution-Grade Baseline)

## 1) Profile Core
- Senior full-stack engineer with strong UI/UX product mindset.
- Operates as a systems designer: workflows first, screens second.
- Demands production-level architecture, maintainability, and measurable execution quality.
- Domain focus: Odoo operations, invoicing/e-invoicing, rentals, logistics, accounting-adjacent processes.

## 2) Non-Negotiable Engineering Constraints
- Enforce SoC: orchestration, UI runtime, i18n, config, and integration logic must be separated.
- Enforce SOLID, DRY, KISS in practical terms, not aspirationally.
- Hard cap mindset: if a file exceeds 600 lines, split by responsibility.
- Prefer config/catalog pattern over magic literals and coupled inline constants.
- Keep changes reversible for high-impact platform/UI modifications.
- Use objective naming; avoid branding language in technical architecture.

## 3) Architecture Expectations
- Frontend:
  - Vue 3 patterns (component contracts + composable behavior), SFC-compatible even in CDN runtime.
  - Reusable UI layers (atoms/components): icon actions, chips, rail links, status primitives.
  - DOM abstraction layer with graceful fallback (sQuery-first when available, native fallback).
  - i18n externalized from logic; YAML catalog as preferred source.
- Backend/integration:
  - Domain-oriented services and bridges (clear integration boundaries).
  - Deterministic, idempotent orchestration where feasible.
  - Server actions/templates separated from manager/orchestrator code.
  - Scriptability and auditability over opaque manual-only flows.

## 4) UX/UI Quality Bar
- Target is not "clean admin"; target is premium product-grade experience.
- Required pillars:
  - Hierarchy and focus (clear primary action and decision path).
  - Progressive disclosure (right detail at right step).
  - High information density with readability.
  - Accessibility-grade contrast and semantic status tokens.
  - Keyboard shortcuts for desktop + touch ergonomics for mobile.
  - Skeleton/loading/empty states with contextual guidance.
  - Smooth but purposeful transitions (no decorative-only motion).
- Tutorial/enablement quality:
  - Human narrative, pedagogical sequencing, role-specific flow.
  - Explain what is relevant now and what is available but out-of-scope.
  - Validation must follow real click paths and behavior side effects.

## 5) Interaction and Validation Standards
- Avoid URL-only checks as primary verification.
- Validate through realistic user behavior:
  - click -> state change -> data effect -> persistence.
  - form edits, save paths, status transitions, and cross-module outcomes.
- Prefer evidence artifacts:
  - screenshots/probes/logged checks with explicit expected outcomes.
- Regression checks after refactors are mandatory for core workflows.

## 6) Current Technical Preferences
- sQuery usage should be leveraged where it improves consistency and ergonomics.
- Repeated markup patterns must be abstracted (helpers/components), not duplicated strings.
- Strings in behavior logic are a smell; move to i18n/config layers.
- Build modular CSS/JS assets to avoid monolith runtime files.

## 7) Collaboration and Delivery Contract
- Prefers concise, high-density, execution-oriented communication.
- Expects incremental delivery with visible checkpoints.
- Prefers surgical commits over large mixed commits.
- Requires explicit clarity on:
  - what is complete,
  - what remains pending,
  - what carries risk.
- Repo/instance isolation is strict and mandatory.

## 8) Anti-Patterns
- Monolithic files hiding multiple concerns.
- Inline mega templates in orchestrators.
- UI polish without workflow coherence.
- Hardcoded tips/labels/messages in runtime logic.
- Weak validations that skip actual interactions.
- Fragmented navigation that breaks operational context.

## 9) Reference-Level Design Direction
- Benchmark style for invoicing UX: modern SaaS dashboards (e.g., Linear/Stripe-grade interaction discipline, Tailwind-era patterns).
- Success criterion:
  - enterprise reliability + premium visual system + fast operator throughput.

## 10) Definition of Done Snapshot
- Architecture decomposed and maintainable.
- No oversized files beyond accepted threshold.
- i18n/config decoupled and auditable.
- UX coherent across desktop/mobile and role contexts.
- Core flows validated with interaction-level evidence.
- Rollback path available for platform-impacting changes.

## 11) Technical Patterns (Extracted from Codebase)
- **Namespaced Module Pattern:** Use IIFEs with `Object.freeze` for namespaced exports (e.g., `YO_INVOICING_DOM`) to simulate static classes/singletons while maintaining strict encapsulation.
- **AOP-style Hydration:** Use `MutationObserver` as a cross-cutting concern to trigger UI bootstrapping/hydration dynamically upon DOM changes (Odoo compatibility).
- **Graceful DOM Abstraction:** Implement a "Bridge" pattern for DOM operations (`sQuery` -> `Native` fallback) to ensure runtime stability across different Odoo environments.
- **Atomic Markup Factory:** Centralize HTML string concatenation in dedicated modules (`MARKUP`) to enforce DRY and prevent XSS through centralized escaping.
- **Reactive State Management:** Use `Vue.reactive` for UI-bound states (KPIs, checklists) even in CDN-distributed SFC environments.
- **Config-Driven Navigation:** All UI entry points (Rail/Sidebar) must be generated from `CONFIG.navigation.railApps` to maintain Open/Closed principle.

## 12) Operating Standards Snapshot
- **Design target:** Award-level visual quality with enterprise usability (Hybrid Linear/Stripe).
- **Engineering target:** Maintainable architecture under continuous iteration (SoC, <600 lines/file).
- **Product target:** Operational clarity, role-fit, and adoption speed.
- **Delivery target:** Reversible, testable, documented, and sync-ready.
