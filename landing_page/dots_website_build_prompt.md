# Dots — Website Build Prompt

Build a premium, responsive landing website for **Dots**, an AI-powered personal execution partner that helps people understand priorities, plan realistic weeks, and adapt when life changes. The website is an early-stage product introduction and waitlist destination—not a task-manager dashboard and not a claim that unimplemented features are already live.

## Creative direction

Create an ownable, editorial visual identity for Dots. Use the reference site Shipwork only for broad inspiration in color contrast and energy; do not copy its layout or components.

- Palette: icy off-white `#F4F7FC`, deep ink `#17172B`, saturated cobalt/violet `#4338F2` with a restrained violet companion, and acid-lime `#C9F455` for meaningful calls to action and state changes.
- Rounded is intentional: use generous 20–28px radii for key panels and product interfaces, and pill-shaped primary buttons. Keep the overall geometry polished and confident rather than bubbly. Do not round every small control or make every section a card.
- Use premium editorial typography, oversized but controlled headlines, strong whitespace, fine borders, subtle shadows, and a small connected-dots brand motif. Keep gradients localized to purposeful surfaces rather than using generic AI gradient backgrounds throughout.
- Product mockups should look like credible software, with coherent schedules, believable times, and consistent state changes.
- Avoid excessive glassmorphism, floating-card collage, repetitive feature grids, decorative 3D objects, emojis, stock imagery, fake customer logos/testimonials, and invented product claims.

## Landing page structure

Build one complete, carefully paced landing page with these sections in this order:

1. **Navigation and hero** — Dots wordmark, anchor links, “Get Early Access” CTA. Headline: “You have things to do. Dots figures out what comes next.” Supporting copy: “An AI execution partner that turns your priorities into a realistic plan, adapts when life gets in the way, and keeps you moving without managing another productivity app.” CTA “Get Early Access”; secondary “See How It Works”. Show a convincing weekly-plan UI beside the copy, including a new urgent task and a proposed schedule change.
2. **The problem** — “Life doesn’t follow your plan.” Explain briefly that people waste time maintaining systems, moving tasks, and rebuilding their day. Contrast a rigid overloaded schedule with a calm adaptive one.
3. **Three connected responsibilities** — Present as a connected composition, not a generic repeated card grid: “01 Understand your priorities” (goals, deadlines, commitments, capacity); “02 Plan your week” (a realistic proposal users can review); “03 Adapt when life changes” (evaluate impact and propose changes).
4. **Interactive product demonstration** — “A plan that adapts.” Show an existing schedule, an urgent task arriving through Telegram, Dots’ proposed adjustment, preserved commitments, a task moved to tomorrow, and a clear approval control. If implemented as a simulation, use coherent deterministic sample data and let users reset/trigger the scenario. Distinguish proposed from approved changes visually.
5. **Telegram interaction** — Show a concise representative conversation. User: “An urgent task just came in. I need two hours for it today.” Dots: “Your afternoon has limited flexibility. I can move the research block to tomorrow and shorten today’s admin session. Your fixed commitments remain unchanged.” Dots then presents a concise proposed change and approval action. Make clear Telegram is an interaction channel; Dots is responsible for understanding context and maintaining the plan.
6. **Planning philosophy** — “Realistic, not perfect.” Visualize actual availability, protected commitments, flexible work, considered adjustments, clear reasons, and user control. Avoid a wall of text.
7. **A typical week** — A connected timeline: weekly planning day (Sunday is only an example), each morning, throughout the day, when plans change, end-of-week reflection.
8. **Early access** — Early-stage positioning; “Join the Waitlist”. Email input with client-side format validation and accessible error/success states. Do not claim successful registration without a real backend. If no signup integration is configured, explicitly state that the form is a prototype/not connected and do not pretend that an email was submitted.
9. **FAQ accordion** — Include: What exactly is Dots? How is Dots different from a task manager? How does weekly planning work? What happens when an urgent task arrives? Can I use Dots through Telegram? Do I have to approve every schedule change? Is Dots available yet? Answer accurately and avoid inventing integrations, privacy guarantees, availability, or capabilities.
10. **Final CTA and footer** — Headline: “Less time managing your life. More time living it.” CTA “Get Early Access”, Dots mark, concise description, minimal navigation.

## Interaction and accessibility

- Responsive desktop, tablet, and mobile layouts designed intentionally, not merely scaled down.
- Semantic HTML, keyboard navigation, visible focus states, adequate contrast, reduced-motion support, and accessible form labels/errors.
- Working anchor navigation, FAQ accordion, hover/focus states, and a product-demo state transition if feasible.
- Motion should explain the product: gently animate an incoming task and the resulting proposal; avoid continuous distracting motion.
- Do not use dead buttons, fake success states, placeholder copy, or unverified claims.

## Delivery quality

Produce a cohesive, polished implementation that feels built specifically for Dots. Reuse consistent design tokens and components. Prioritize clarity of the product promise, strong rounded visual language, realistic product interfaces, performance, readability, and responsive composition. Before coding, inspect the supplied visual prototypes and preserve their strongest design decisions while improving precision and consistency.