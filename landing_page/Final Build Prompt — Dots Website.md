# Final Build Prompt — Dots Website

Build a polished, responsive landing website for **Dots**, an early-stage AI personal execution partner that helps people clarify priorities, plan realistic weeks, and adapt when life changes. Use the existing Dots visual prototypes as inspiration if they are available in the project, but treat them as visual references only: generated mockup copy, dates, percentages, and schedule details are not authoritative. Do not invent product capabilities, customer evidence, integrations, privacy claims, or availability.

## 0. Inspect before changing anything

- First inspect the current project and confirm its actual root, existing files, and any framework already in use.
- Reuse the existing project and stack when practical. If this is a fresh static landing-page folder, use semantic HTML, CSS, and vanilla JavaScript as planned; do not add a framework or heavy dependencies without a real need.
- Do not overwrite unrelated work or create a second nested project. If the proposed project path `/home/anwar/Projects/Time_Mang_App/landing_page/` is not available in the active environment, stop and report the path mismatch rather than silently creating the site somewhere else.
- Build the site only after the user has approved the visual direction. The current request is for this build prompt; the prototype images are not the website.

## 1. Brand identity and exact logo specification

Create a crisp, reusable vector logo directly as inline SVG (or an equivalent lightweight vector component) so it remains sharp at all sizes. Do not use an emoji, generated raster logo, calendar/checklist cliché, or a generic three-dot ellipsis.

**Dots mark:** a distinctive miniature constellation showing three circular nodes rising from lower-left to upper-right, joined by one thin, smooth, rounded cobalt connector. Use two indigo/cobalt nodes and one acid-lime endpoint node. The three circles should be intentionally different in scale (middle node slightly larger) but remain simple and balanced. The direction of travel suggests ideas connecting and moving forward; the lime endpoint signals clarity/action. Keep the complete mark legible at 24–32px. No gradients inside the dots, no shadows, no enclosing badge, no extra nodes.

**Wordmark:** write `Dots` in title case, set in a clean, confident sans-serif with semibold weight and slightly tight tracking, in deep ink. Place the mark to the left with a comfortable 8–10px gap and optically align it to the wordmark. Use the same lockup consistently in the navbar and footer; use the mark alone only where space requires it (e.g. favicon).

## 2. Visual direction

Use Shipwork (`https://shipwork.io/`) as inspiration for the *navigation-bar structure and visual restraint* only. Specifically, take cues from its compact, contained top navigation, clean brand-left / navigation-middle / action-right arrangement, subtle surface boundary, and disciplined spacing. Do **not** copy its logo, exact menu labels, page layout, or visual assets.

- Canvas: icy off-white `#F4F7FC`.
- Primary text / deep ink: `#17172B`.
- Main cobalt: `#4338F2`.
- Companion violet: `#635BFF` (use sparingly, with deep violet `#3127C7` only for depth where needed).
- Acid lime: `#C9F455`, reserved for high-priority actions, active state, and meaningful schedule changes.
- Fine borders: `rgba(23, 23, 43, 0.08)` on light surfaces and `rgba(244, 247, 252, 0.12)` on dark surfaces.
- Aim for a quiet premium balance: mostly light neutral canvas, ink typography, a few confident cobalt/violet surfaces, and small lime accents. Do not make the whole site a purple gradient or use lime as a large background everywhere.
- Use polished editorial typography (Plus Jakarta Sans if already configured and appropriate; otherwise a suitable system sans-serif fallback). Headlines can be large and expressive but must wrap cleanly across breakpoints.
- Rounded geometry is a signature, not decoration: 20–28px corner radii on major product panels, approximately 16–20px on the navbar and content panels, and pill-shaped primary buttons. Use soft, restrained shadows and ample negative space; not every section needs a card.
- Keep UI mockups credible, readable, consistent, and aligned. Avoid excessive glassmorphism, busy gradients, generic AI blobs, floating-card collages, repeated feature cards, stock imagery, and fake testimonials.

## 3. Navbar — inspired by Shipwork, made for Dots

Build a compact rounded horizontal navigation shell, centered with a maximum width around 1200px and a comfortable outer margin. On desktop it should be approximately 60–64px high, with an off-white/white solid surface, a fine border, subtle shadow, and around 16–20px radius. Avoid a heavy blur or oversized floating pill.

- Left: the exact Dots SVG mark and wordmark.
- Middle: concise anchor links: `How it works`, `Planning`, `FAQ`.
- Right: one prominent acid-lime pill button `Get Early Access`.
- Do not add `Sign in`, account/profile icons, `Pricing`, search, or a product-login affordance unless the product truly supports those destinations. Do not leave dead links.
- Keep it sticky only if it remains unobtrusive and does not cover section headings when anchor-scrolled. Provide visible keyboard focus states.
- On mobile, show the logo and an accessible menu toggle; collapse the links into a compact menu and retain an easy-to-reach early-access CTA without horizontal overflow.

## 4. Landing-page sections — in this order

### A. Hero — “Your life, thought through”

Headline: **“You have things to do. Dots figures out what comes next.”**

Supporting copy: “An AI execution partner that turns your priorities into a realistic plan, adapts when life gets in the way, and keeps you moving without managing another productivity app.”

Primary CTA: **Get Early Access**. Secondary CTA: **See How It Works**.

Pair the message with a convincing product preview: a simple weekly/daily schedule, an incoming urgent-task message, and an explicitly proposed update. Show that fixed commitments are protected. The opening viewport should immediately explain what Dots does and why it matters.

### B. The problem — “Life doesn’t follow your plan”

Briefly show the friction of constantly maintaining tools, moving tasks, and rebuilding plans. Contrast a rigid overloaded day with a considered adaptive plan. Keep the contrast empathetic, not alarmist: avoid red error warnings, shame, or implying the user has failed.

### C. Three connected responsibilities — “One system, three responsibilities”

Use a connected visual narrative, not three interchangeable feature cards:
1. **Understand your priorities** — goals, commitments, deadlines, and available time.
2. **Plan your week** — a realistic proposal based on capacity that the user reviews.
3. **Adapt when life changes** — evaluate trade-offs and propose an adjustment.

### D. Product demonstration — “A plan that adapts”

Build a clear deterministic front-end demonstration, not a claim of a live AI integration. Include a button to trigger the sample urgent-task scenario, a visible proposed state, `Approve changes`, and `Reset plan` controls. Use one coherent sample schedule: an urgent task needs two hours today; move a flexible research block to tomorrow and shorten today's flexible admin time; preserve fixed client-review/meeting commitments. Clearly distinguish current, proposed, and user-approved states. Approval should only change the local demo state; do not imply data is being sent or saved to a real service. Provide an accessible status announcement for state changes.

### E. Telegram interaction — “Life happens outside the app”

Present Telegram as a representative interaction channel, not as an implemented or connected integration. Sample exchange:

- User: “An urgent task just came in. I need two hours for it today.”
- Dots: “Your afternoon has limited flexibility. I can move the research block to tomorrow and shorten today’s admin session. Your fixed commitments remain unchanged.”

Show a concise proposed change and approval control within the illustrative mockup. Label the conversation as a concept/demo if needed so visitors do not mistake it for a live integration.

### F. Planning philosophy — “Realistic, not perfect”

Use a compact visual of protected commitments, available capacity, flexible work, and time reserved for life changing. State that changes should include understandable reasons and that the user remains in control. Do not use invented percentages, research claims, or numeric capacity breakdowns.

### G. A typical week with Dots

Use a connected timeline:
- Weekly planning day: review priorities and approve a proposed week. Sunday may be given only as an example; it must not be the only assumed planning day.
- Every morning: see what matters today and why.
- Throughout the day: capture new tasks and changes.
- When plans change: review a proposed adjustment.
- End of week: reflect on what moved forward and what should change next.

### H. Early access / waitlist

Use concise early-stage product copy and CTA **Join the Waitlist**. Provide a labelled email input, client-side format validation, accessible error messages, and a clear privacy/status note. There is no confirmed waitlist backend in this scope: never submit, store, or claim to have registered an email. If no real integration exists, label the form visibly as a prototype and tell users the email is not sent or stored. Do not promise a backend “coming soon.”

### I. FAQ

Provide an accessible accordion with these questions:
- What exactly is Dots?
- How is Dots different from a task manager?
- How does weekly planning work?
- What happens when an urgent task arrives?
- Can I use Dots through Telegram?
- Do I have to approve every schedule change?
- Is Dots available yet?

Answer cautiously and accurately. Do not claim that the AI, Telegram integration, privacy guarantees, or waitlist are already implemented unless verified.

### J. Final CTA and footer

Headline: **“Less time managing your life. More time living it.”** CTA: **Get Early Access**. Repeat the Dots logo lockup, a concise product description, and only minimal real navigation links.

## 5. Motion, accessibility, and responsive behavior

- Use motion only to explain state: a new task arrives, a flexible block moves, and the proposal becomes approved. Keep transitions short and provide `prefers-reduced-motion` support.
- Use semantic HTML, keyboard-accessible navigation, visible focus indicators, labelled controls, adequate contrast, and accessible accordion semantics (`aria-expanded` and `aria-controls`).
- Ensure layouts are intentionally responsive for desktop, tablet, and mobile—not simply scaled desktop columns. Preserve a readable order on small screens.
- Use smooth anchors only when they do not interfere with keyboard navigation or reduced-motion preferences.
- Avoid custom scrollbars unless they are essential; native browser scrolling is preferable.

## 6. Implementation and verification

- Prefer semantic `index.html`, `styles.css`, and `app.js` for a genuinely static existing project, or respect the already-existing framework if one is present.
- Keep design tokens in CSS custom properties; keep schedule sample data deterministic and centralized rather than duplicating inconsistent times/copy.
- Make every visible navigation item and CTA work or remove it. The form must not simulate a successful signup without a backend.
- Run the local server in the confirmed project root. Verify HTTP responses for the entry page and local assets.
- Inspect the page at desktop and mobile widths. Test anchor links, mobile menu, reduced-motion behavior, FAQ keyboard interaction, valid/invalid email feedback, and demo trigger/approve/reset states.
- Fix visible overflow, clipping, mismatched schedule states, inaccessible focus, and console errors before reporting completion.
- Do not fabricate metrics such as “50% focused / 30% flexible / 20% changes” from visual prototypes. Do not use inconsistent menu labels across sections or frames.

Deliver the implemented landing page and a brief summary of what is functional versus illustrative. Clearly report any remaining backend dependency for waitlist or Telegram.