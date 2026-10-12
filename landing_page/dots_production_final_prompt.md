# Final Production Build Prompt — Dots

Build and improve the **real production website for Dots**, an AI personal execution platform. This is **not a prototype, mockup, static HTML demo, or throwaway landing page**. The Dots platform/backend already exists and will be integrated with this frontend in the next phase. Build the frontend as a maintainable production codebase that can consume real Dots data and APIs without requiring a redesign or rewrite later.

## 0. Non-negotiable product context

- Dots is an actual product/platform, not a fictional concept.
- The current local website at `http://localhost:4180/` is only the current visual starting point. Inspect it, preserve useful content and brand decisions, but do not treat its hardcoded demo data as authoritative product data.
- Do not create a fake backend, fake authentication, fake persistence, or pretend integrations are live.
- Do not overwrite or damage the existing Dots platform. First inspect the actual repository, framework, package manager, routes, environment variables, API clients, authentication, database access, and existing design system.
- If the existing project is already React or Next.js, extend it in place. If it is a static HTML project, migrate it carefully into a production React/Next.js structure rather than continuing to add static HTML.
- Reuse the existing stack when practical. Do not introduce a new framework or replace working infrastructure without a clear technical reason.
- Never silently create a second nested project or work in an unrelated directory.
- Before changing files, report the detected project root, framework, existing routes, and integration points in the implementation notes.

## 1. Product positioning

Dots helps people understand what matters, plan realistic weeks, and adapt when life changes without destroying their commitments.

Core product concepts:

- Priorities
- Goals
- Deadlines
- Fixed commitments
- Flexible work
- Available capacity
- Reality buffers
- Weekly planning proposals
- Daily execution plans
- Adaptation proposals when plans change
- Explicit user approval or rejection
- Clear reasons behind every recommendation
- Future integrations such as calendars, Telegram, voice input, and notifications

The product promise is calm control, not aggressive optimization. Dots should feel intelligent, transparent, and respectful of user agency.

Primary brand statement:

> You have things to do. Dots figures out what comes next.

Supporting idea:

> Dots turns priorities into a realistic plan, adapts when life gets in the way, and explains the trade-offs instead of silently reshuffling your life.

Do not make unsupported claims about automation, integrations, customers, availability, security, AI accuracy, or production readiness.

## 2. Technical direction

Build a production-quality frontend with:

- React and TypeScript, preferably within Next.js if the existing project supports it.
- Reusable components with clear responsibility boundaries.
- A real application shell and route structure, not one oversized page component.
- A typed domain model for Dots entities and scheduling states.
- A dedicated API/service adapter layer so UI components do not depend directly on backend implementation details.
- Environment-based configuration for API URLs and integration settings.
- Loading, empty, error, optimistic, pending, success, and retry states.
- No hardcoded production data embedded inside UI components.
- Development fixtures/mock adapters isolated behind a clear interface and labeled as fixtures.
- A design-token system for color, typography, spacing, radius, shadows, blur, z-index, and motion.
- Responsive behavior for desktop, tablet, and mobile.
- Keyboard accessibility, visible focus states, semantic HTML, and `prefers-reduced-motion` support.
- Strict TypeScript and the repository's existing lint/typecheck/build conventions.
- A route manifest at `/manus-routes.json` if required by the hosting environment, synchronized with the actual routes.

Suggested structure, adapted to the existing repository rather than copied blindly:

```text
src/
  app/ or pages/
  components/
    brand/
    navigation/
    marketing/
    schedule/
    proposals/
    primitives/
  features/
    planning/
    execution/
    adaptation/
    waitlist/
  lib/
    api/
    auth/
    config/
    motion/
    validation/
  domain/
    priorities/
    schedules/
    proposals/
  styles/
  fixtures/
```

## 3. Existing platform integration boundary

Prepare the frontend for integration with the existing Dots platform without inventing the backend contract.

Before implementation:

1. Inspect existing API routes, server actions, client SDKs, schemas, auth/session handling, and environment variables.
2. Identify which data already exists and which data is currently only visual content.
3. Create or reuse typed adapters for:
   - current user/session
   - priorities and goals
   - commitments
   - schedule/day plan
   - weekly planning proposal
   - adaptation proposal
   - approval/rejection actions
   - waitlist or early-access submission
4. Keep external integration channels behind adapters. Telegram, calendars, voice, and notifications must not be presented as connected unless the repository proves that they are connected.
5. When an endpoint is missing, show a truthful unavailable/coming-soon state or use a clearly isolated fixture mode. Never fake a successful API response.
6. Preserve user agency: recommendations are proposals until the user explicitly approves them.

Every schedule item should support a domain state such as:

- `protected`
- `flexible`
- `routine`
- `proposed`
- `moved`
- `approved`
- `rejected`
- `completed`
- `overdue`
- `unavailable`

Use typed state mappings rather than scattered string comparisons.

## 4. Visual direction: premium calm liquid glass

Create an ownable Dots aesthetic inspired by the **layering, restraint, and floating navigation language of Shipwork**, but do not copy Shipwork's logo, exact layout, text, components, colors, or branding.

The desired movement is:

> Calm intelligent glass — a soft, editorial productivity interface where translucent layers reveal a system adapting underneath.

### Core principles

1. **Clarity over decoration** — every glow, blur, border, and animation must support hierarchy or state.
2. **Layered depth** — use a small number of purposeful translucent surfaces over composed backgrounds; do not make every element glass.
3. **Quiet confidence** — spacious layouts, restrained copy, strong typography, and no noisy dashboard clutter.
4. **Visible reasoning** — proposed changes and trade-offs must be visually understandable, not hidden behind decorative motion.

### Palette

Use the existing Dots direction as the base:

- Background: icy off-white / cool mist, approximately `#F4F7FC`.
- Deep ink: approximately `#17172B`.
- Cobalt / indigo: approximately `#4338F2`.
- Acid lime signature accent: approximately `#C9F455`.
- Muted lavender and cool gray for secondary surfaces.
- Use lime selectively for positive actions, proposed changes, and meaningful state transitions.
- Do not turn the whole page into a purple gradient or use lime as a generic decoration.

### Liquid-glass rules

Use glass only where it creates a clear layer:

- Floating navbar: translucent surface, backdrop blur, subtle white border, soft shadow, large radius, and visible separation from the page.
- Selected product panels: translucent white or dark surfaces with controlled blur and faint inner highlights.
- Proposal overlays and status callouts: stronger contrast than ordinary cards so their state remains legible.
- Do not use blur behind dense text if it reduces readability.
- Do not stack excessive translucent cards on top of each other.
- Always provide a solid/fallback background for browsers without backdrop-filter support.
- Keep borders subtle and avoid bright white outlines around every component.
- Use localized gradients and ambient glows, not generic full-page AI gradients.

### Navbar

Build a floating contained navbar similar in structural spirit to Shipwork:

- Dots logo on the left.
- Short anchor links or product links in the center.
- One primary CTA on the right.
- Compact pill/container shape with translucent glass, blur, thin border, and soft shadow.
- It should remain readable over light and dark hero areas.
- It should become a proper mobile navigation menu, not a squeezed desktop row.
- Do not add Search, Sign in, Pricing, or account actions unless they are real product routes.

## 5. Logo specification

Create the Dots logo as reusable inline SVG or a lightweight vector component, not a raster image or emoji.

### Mark

- Three circular nodes rising from lower-left to upper-right.
- One thin, smooth, rounded cobalt connector joins them.
- Two nodes use indigo/cobalt; the final upper-right node uses acid lime.
- The nodes should have intentionally different scale: the middle node may be slightly larger.
- The mark represents ideas becoming connected, priorities becoming clear, and action moving forward.
- Keep it recognizable at 24–32px.
- No gradients inside the dots.
- No enclosing badge.
- No extra nodes.
- Do not use a generic three-dot ellipsis.
- Do not use a calendar, checkmark, or checklist cliché.

### Wordmark

- Use `Dots` in title case.
- Use a clean, confident sans-serif with semibold weight and slightly tight tracking.
- Deep ink color.
- Comfortable 8–10px gap between mark and wordmark.
- Use the same lockup in navbar and footer.
- Use the mark alone only where space requires it, such as favicon or compact mobile UI.

## 6. Production marketing experience

The main public experience should be a polished production marketing site that accurately introduces the real platform and provides clean integration points for the future product experience.

Recommended sections, adapted to the existing product and routes:

### A. Navigation and hero

Headline:

> You have things to do. Dots figures out what comes next.

Supporting copy:

> An AI execution partner that turns your priorities into a realistic plan, adapts when life gets in the way, and keeps you moving without managing another productivity app.

Show a credible product surface beside the copy. The surface may use fixtures only when the real API is unavailable, and must be labeled internally as fixture data. It should communicate:

- protected commitment
- urgent request
- proposed adjustment
- flexible task moved
- explanation of the trade-off

The hero must not look like a fake dashboard screenshot. It should feel like a living product surface with subtle state transitions.

### B. The problem

Explain that rigid systems force users to constantly maintain schedules, move tasks, and rebuild their day. Avoid shame, fear, red warning overload, or implying the user is failing.

Visually contrast:

- brittle schedule with cascading conflicts
- calm adaptive plan with protected commitments and preserved buffer

### C. Three responsibilities

Present these as a connected composition, not a generic three-card grid:

1. Understand your priorities.
2. Plan your week.
3. Adapt when life changes.

Use the Dots constellation motif as a visual connection between the stages.

### D. Interactive product explanation

Create a polished, purposeful product interaction that explains the adaptation model:

- A user has a balanced plan.
- A new urgent request arrives.
- Dots evaluates capacity and constraints.
- Fixed commitments remain protected.
- A flexible task is moved or resized.
- Dots explains why.
- The user can review and approve the proposal.

If the interaction is not connected to the platform yet, make it a clearly isolated product explainer driven by fixture data. Do not call it a production API or claim Telegram is connected.

Motion requirements:

- The new request enters with a calm, short transition.
- The proposal appears with a clear state change.
- Flexible rows move with layout-preserving animation.
- Protected rows remain visually anchored.
- Explanation text fades or slides in after the state change.
- Avoid flashy bouncing, excessive parallax, or animation that makes the schedule difficult to read.

### E. Product channels and integrations

Explain that Dots can become the execution layer across the user's real life, but separate current capabilities from planned integrations.

Use truthful labels such as:

- Available now
- In development
- Planned integration
- Connect when available

Never imply that Telegram, calendar, voice, or notifications are active unless confirmed by the existing platform code.

### F. Planning philosophy

Explain:

- protected commitments
- available capacity
- flexible focus work
- reality buffer
- explicit approval
- transparent reasons

### G. Workflow

Show the loop:

- planning review
- daily briefing
- execution
- adaptation when reality changes
- quiet weekly reflection

Do not hardcode Sunday as the universal planning day. If an example is needed, label it as an example or user's chosen day.

### H. Early access / waitlist

Build a real form boundary:

- Validate email on the client.
- Use the existing waitlist endpoint/service if one exists.
- Show loading, success, error, duplicate, and unavailable states.
- If no backend exists, do not claim the email was stored or sent. Say clearly that the form is not connected yet.
- Do not include false claims such as “no tracking” unless confirmed by the actual implementation.

### I. FAQ and footer

Use honest answers based on actual product status. Do not invent availability dates or integration guarantees.

## 7. Motion system

Use a consistent motion system, preferably Motion/Framer Motion if already supported by the project.

Motion should communicate hierarchy and state:

- Page entrance: restrained opacity and vertical movement.
- Hero product surface: subtle ambient movement, not constant distracting animation.
- Scroll reveals: short, staggered, viewport-aware.
- Glass surfaces: gentle hover elevation and highlight shift.
- Buttons: tactile but restrained press/hover states.
- Schedule changes: layout-aware transitions so rows do not teleport.
- Proposal approval: clear transition from proposed to approved.
- Navbar: stable floating behavior with no jitter.
- Mobile: reduce complexity and disable nonessential ambient motion.
- Respect `prefers-reduced-motion` and provide equivalent state changes without animation.

Avoid:

- random floating blobs everywhere
- infinite gradient animations behind every section
- excessive 3D objects
- generic glassmorphism templates
- animation that delays access to content
- fake AI typing effects used as decoration

## 8. Content and product truth

Keep the tone direct, calm, intelligent, and human.

Use language that explains rather than exaggerates:

- “proposes” instead of “automatically controls your life”
- “explains the trade-off” instead of “optimizes everything”
- “review and approve” instead of “we decide for you”
- “planned integration” instead of “connected” when it is not implemented

Remove or rewrite any copy that exposes an unfinished prototype, including phrases like:

- “front-end simulation”
- “local scenario preview”
- “representative concept”
- “production backend integration coming soon”

Replace them with truthful product-explainer language that does not pretend the feature is live.

Avoid unsupported percentages, invented customer evidence, fake testimonials, fake logos, fake dates, and fake schedule statistics.

## 9. Validation and delivery

Before considering the work complete:

1. Inspect and preserve existing platform functionality.
2. Confirm the actual project root and framework.
3. Confirm the app starts on the expected local port.
4. Run the repository's typecheck, lint, and build commands.
5. Verify the main routes and navigation.
6. Verify mobile layout and keyboard navigation.
7. Verify the Liquid Glass fallback when `backdrop-filter` is unavailable.
8. Verify `prefers-reduced-motion` behavior.
9. Verify all forms have truthful success/error states.
10. Verify no mock data is accidentally sent to production APIs.
11. Verify no unsupported integrations are presented as live.
12. Verify the logo remains sharp and consistent across sizes.
13. Verify no existing Dots platform routes, authentication, or API behavior were broken.

Deliver:

- The production frontend implementation in the existing repository.
- A concise implementation note listing the detected stack, routes changed, API/integration adapters used, fixture boundaries, and commands run.
- Any required environment variable names without exposing secret values.
- A short list of remaining backend integration requirements, clearly separated from completed frontend work.

The final result must feel like a real premium Dots product website: calm, layered, intelligent, responsive, and ready to connect to the existing platform—not a static HTML prototype pretending to be production.
