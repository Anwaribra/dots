# Dots — Exact Four-Section Premium Rebuild Prompt

Build the real production frontend for Dots by reproducing the **four attached/reference designs almost exactly**.

The four reference screens are the visual source of truth:

1. The Hero / weekly planning screen.
2. The Problem screen: rigid plan versus adaptive plan.
3. The Capabilities screen: one system, three responsibilities.
4. The Adaptation screen: a plan that flexes with real life.

The user does **not** want a new interpretation, a simplified redesign, a generic SaaS layout, or a visually inspired alternative. Rebuild the same visual system, composition, proportions, spacing, hierarchy, surfaces, colors, illustrations, product UI, connection lines, and motion language from the four references.

The only intentional brand change is:

> Replace the old/reference logo with the current Dots logo and wordmark.

Everything else should remain visually faithful to the references.

This must be implemented as editable, production-quality React/Next.js code inside the existing Dots project. Do not use the screenshots as backgrounds, do not embed them as images, and do not deliver a static HTML mockup.

## 1. Non-negotiable instruction

Do not redesign these sections.

Do not make them “similar.”

Do not replace the organic composition with cards.

Do not remove the connecting paths, nodes, calendar surfaces, floating panels, or motion graphics.

Do not simplify the product UI into one basic white card.

Do not change the visual rhythm to match the current localhost page if it conflicts with the reference images.

The reference images have priority for visual design. Existing Dots product truth has priority for claims and live integration behavior.

Use the current Dots logo instead of the reference logo, but preserve the reference logo’s position, scale, alignment, and visual importance.

## 2. First inspect the existing project

Before editing:

- Inspect the actual repository root, framework, package manager, routes, styles, components, animation library, and existing Dots platform integration points.
- Confirm what currently renders `http://localhost:4180/`.
- Reuse the existing React/Next.js setup if present.
- If the current site is static, migrate the sections into proper reusable React components rather than adding more static HTML.
- Do not create a second nested application.
- Do not replace or damage the existing Dots platform, auth, API, or backend.
- Do not invent a backend, database, authentication, calendar integration, Telegram integration, or production API.
- Keep fixture/demo data isolated from real platform data.

## 3. Preserve the exact reference design system

Use the same visual language as the references:

- Premium editorial SaaS design.
- Cool off-white background.
- Deep ink/navy typography.
- Strong cobalt/indigo/violet product surfaces.
- Soft lavender supporting panels.
- Acid-lime accents for important states and actions.
- Large rounded containers.
- Organic asymmetrical silhouettes.
- White glass product interfaces.
- Subtle blur, soft shadows, inner highlights, and layered depth.
- Fine connector lines and circular nodes.
- Large confident typography.
- Generous whitespace.
- Carefully composed product UI instead of generic decorative cards.

Approximate palette:

- Cool off-white: `#F4F7FC`
- Deep ink: `#17172B`
- Cobalt/indigo: `#4338F2`
- Dark cobalt: `#2930C9`
- Acid lime: `#C9F455`
- Soft lavender: `#E9E9FF`
- Muted indigo-gray for secondary copy

Do not use a full-page purple gradient. Keep violet/cobalt concentrated in the product surfaces and key transitions, as in the references.

## 4. Logo replacement rule

Replace only the old/reference logo with the current Dots logo.

The replacement logo must:

- Use the current Dots mark and wordmark.
- Be a crisp reusable SVG/vector component.
- Keep the same approximate placement, size, and alignment as the reference logo.
- Work in navbar, footer, product shell, and compact UI contexts.
- Preserve the reference’s strong brand presence.
- Not be replaced by an emoji, generic dots, or a random icon.

Do not change the rest of the visual identity to accommodate a different logo.

## 5. Section 1 — Hero / weekly planning screen

Recreate the first reference screen with the same layout and visual hierarchy.

### Structure

- Floating top navigation with the Dots logo on the left.
- Center navigation links with the same spacing and understated typography.
- Primary lime CTA on the right.
- Large editorial headline on the left.
- Product planning interface on the right.
- A large cobalt/violet ambient shape behind the upper-right area.
- White glass calendar/product shell with layered depth.
- Telegram/input notification floating near the product surface.
- Lime rescheduling/proposal callout.
- Before/after schedule comparison panel.
- Small feature signals below the headline.

### Content direction

Use the Dots product message, but preserve the reference hierarchy:

- Main idea: `You have things to do. Dots figures out what comes next.`
- Supporting idea: Dots builds realistic plans, protects what matters, and adapts when life changes.
- CTA: `Get Early Access`
- Secondary action: `See How It Works`

Do not make the hero a plain left-text/right-card layout. The product surface must feel like the main visual event.

### Product UI fidelity

Recreate a believable weekly calendar interface with:

- Sidebar navigation inside the product shell.
- Week/date header.
- Multiple day columns.
- Time rows.
- Fixed commitments.
- Flexible tasks.
- Focus work.
- A new urgent request.
- A proposed adjustment.
- A before/after comparison.

Keep data as clearly isolated fixtures until real Dots API contracts are available. Do not claim that Telegram or automatic rescheduling is live if it is not.

### Hero motion

- Navbar enters subtly.
- Hero copy fades/slides into place.
- Calendar shell rises into view with a soft spring.
- Calendar blocks appear in a restrained stagger.
- A Telegram/input message arrives after the calendar settles.
- A curved connector draws from the message to the affected schedule area.
- The proposed lime adjustment appears after the connector completes.
- Before/after panel transitions with a smooth layout animation.
- Ambient cobalt shape moves very slowly.
- No flashy, random, or distracting animation.

## 6. Section 2 — Problem / rigid plan versus adaptive plan

Recreate the second reference screen with the same centered headline and visual comparison.

### Structure

- Floating navbar matching the reference.
- Large centered headline:

  `Life doesn’t follow your plan.`

- Supporting line:

  `Stop rebuilding your day every time something changes.`

- Two large schedule surfaces: rigid plan on the left, adaptive plan on the right.
- A central Dots connector/transition motif between them.
- A visual arrow or progression from chaos to clarity.
- Handwritten/editorial callout labels around the schedule surfaces.
- A strong CTA at the bottom center.
- Soft pastel ambient shapes at the far edges.

### Rigid plan

Show:

- Overloaded schedule.
- Tasks crossed out or visibly pushed.
- Multiple urgent interruptions.
- Soft pink/muted warning treatment.
- Editorial labels explaining that the plan keeps shifting and the day ends behind.

Do not shame the user. The visual should explain why rigid systems fail.

### Adaptive plan

Show:

- Protected fixed commitments.
- Urgent task absorbed into a realistic window.
- Flexible block moved to create room.
- A calmer schedule with preserved buffer.
- Editorial labels such as commitments stay protected and Dots finds the right place.

### Motion

- Rigid schedule items enter slightly misaligned and settle into a visibly overloaded state.
- A disruption pulse travels through the rigid schedule.
- The central Dots connector animates from scattered muted nodes into an ordered cobalt/lime path.
- The adaptive schedule assembles in a clean sequence.
- Protected items lock into place.
- Flexible item moves with a smooth layout transition.
- The final adaptive state becomes calmer and brighter.
- The motion must tell the story without requiring a paragraph of explanation.

## 7. Section 3 — One system, three responsibilities

Recreate the third reference screen almost exactly.

Headline:

`One system. Three responsibilities.`

Supporting copy:

`Dots connects what matters, plans your time, and adapts when life changes — so you can keep moving forward.`

### Exact composition

Do not use three equal cards.

Use:

- Left soft lavender organic panel.
- Dominant center cobalt/indigo organic panel.
- Right soft lavender/blue organic panel.
- Curved SVG paths linking left to center and center to right.
- Lime circular nodes at connection points.
- Large white glass calendar surface inside the center panel.

### Left panel

Title:

`Understand priorities`

Supporting copy:

`Bring together your goals, deadlines and capacity.`

Include three stacked white glass cards:

- Goals — Product launch
- Deadline — Apr 25, 2025
- Capacity — 20 hrs this week

### Center panel

Title:

`Plan your week`

Supporting copy:

`Turn priorities into a realistic plan with protected commitments.`

Include the large white glass weekly calendar from the reference with:

- date range
- weekday columns
- time labels
- fixed commitment blocks
- flexible task blocks
- lime-highlighted meaningful state
- purple-accent task
- fixed/flexible legend

### Right panel

Title:

`Adapt when life changes`

Supporting copy:

`Automatically adjust your plan when something new comes up.`

Include two stacked cards:

- New urgent task — Client request — Today, 2:00 PM
- Moved to make space — Write blog post — Tomorrow, 3:00 PM

### Motion

- Section fades in as one composed system.
- Left path draws first.
- Left lime node appears after the path reaches the center.
- Center calendar shell appears and schedule blocks stagger in.
- Right path draws after the center is established.
- Right lime node and branch path appear.
- Right-side cards enter sequentially.
- Calendar blocks can gently highlight one at a time to show the flow from priorities to planning to adaptation.
- Keep motion smooth, editorial, and product-like.
- Use SVG path drawing with `pathLength` or the existing motion library.
- Under reduced motion, render the final state immediately.

## 8. Section 4 — Adaptation / plan flexes with real life

Recreate the fourth reference screen with the same rich cobalt background and glass product shell.

### Structure

- Floating navigation at the top.
- Large headline about the plan moving with the user.
- Supporting copy about telling Dots what changed and seeing the new plan.
- Large cobalt/violet feature surface.
- White glass application shell centered inside it.
- Left product/sidebar navigation.
- Center conversation between user and Dots.
- Right current-plan/proposed-plan comparison.
- Top-right `Approve changes` CTA.
- Bottom green/lime confirmation strip.
- Small benefit statements beneath the feature surface.

### Product shell

Use a realistic application layout with:

- Dots brand mark.
- Today, Tomorrow, Calendar, Tasks, Settings-style navigation.
- User urgent request bubble.
- Dots response bubble explaining the trade-off.
- Input field at the bottom.
- Current plan column.
- Proposed changes column.
- Research moved to tomorrow.
- Fixed client review visibly protected.
- Approval button.

### Motion

- User message appears first.
- Dots reasoning response follows with a short delay.
- Current plan establishes before proposed plan.
- Proposed column reveals changes one row at a time.
- Research row moves from today to tomorrow using layout-aware motion.
- Protected commitment remains visually anchored.
- Lime approval strip slides/fades in only after the proposal is fully visible.
- Clicking `Approve changes` transitions proposed state to approved state.
- Clicking reset returns to the initial state.
- Use calm spring motion, not exaggerated bouncing.

Do not label the feature as automatic or live if the existing platform does not support it. Use `Proposed changes`, `Review changes`, and `Approve changes`.

## 9. Shared motion system across all four sections

Use one consistent motion language:

- Scroll-triggered entrances.
- SVG connector path drawing.
- Staggered product UI assembly.
- Soft glass elevation on hover.
- Layout-aware schedule movement.
- Calm spring transitions.
- Subtle ambient gradient movement.
- Clear state changes.
- No random floating objects.
- No excessive parallax.
- No constant distracting animation.
- No motion that harms readability.
- Respect `prefers-reduced-motion`.

Motion timing should feel premium:

- Micro-interactions: 160–260ms.
- Card entrances: 450–700ms.
- Connector drawing: 700–1100ms.
- Section sequence: approximately 1.2–2.2 seconds depending on complexity.
- Use smooth easing or spring curves consistently.

## 10. Production implementation

Create reusable components, for example:

- `DotsLogo`
- `FloatingNavbar`
- `HeroPlanningSection`
- `RigidVsAdaptiveSection`
- `ThreeResponsibilitiesSection`
- `AdaptationEngineSection`
- `GlassSurface`
- `WeeklyCalendar`
- `ScheduleBlock`
- `ConnectionPaths`
- `ProposalCard`
- `PlanComparison`

Use semantic HTML, accessible headings, keyboard-safe controls, and responsive layouts.

Keep visual fixture data separate from components. Prepare clean adapters so real Dots priorities, capacity, commitments, schedule proposals, and approval actions can replace fixture data later without redesigning the sections.

Do not send fixture data to production APIs.

## 11. Responsive behavior

Desktop must preserve the reference compositions and proportions.

Tablet may reduce density but must preserve the visual hierarchy.

Mobile must become a carefully designed vertical narrative, not a broken desktop layout:

- Hero product surface follows the headline.
- Rigid/adaptive comparison becomes a readable sequence.
- Three responsibilities become a connected vertical flow.
- Adaptation feature shell becomes a scrollable but readable product surface.
- Connector paths remain visible in simplified vertical form.
- Calendar content must remain legible.
- Do not shrink everything until text and schedule blocks are unreadable.

## 12. Validation and acceptance

Before delivery:

- Run the real lint, typecheck, build, and existing tests.
- Verify all four sections at desktop and mobile widths.
- Verify scroll-triggered motion.
- Verify SVG path drawing and node sequencing.
- Verify the current Dots logo replaces the old logo everywhere.
- Verify the product UI is implemented in code and not as a screenshot.
- Verify `prefers-reduced-motion`.
- Verify Liquid Glass fallback without `backdrop-filter`.
- Verify all interactive proposal states and reset behavior.
- Verify no unsupported live integrations are claimed.
- Verify existing Dots routes, authentication, APIs, and platform behavior remain intact.

## Final instruction

The final result must look like the same premium Dots design system shown in the four reference images — not a redesign, not an approximation, and not a generic glassmorphism page.

Reproduce the **same visual composition, same product storytelling, same organic panels, same calendar surfaces, same connector graphics, same lime/cobalt hierarchy, and same motion-graphic language**.

The only deliberate visual change is the replacement of the old/reference logo with the current Dots logo.

Build it as real, maintainable, production-ready frontend code.
