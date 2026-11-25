## Accessibility

Target: WCAG 2.2 AA. After any UI change, run `lint:a11y` and `test:a11y`. Never add accessibility overlays or widgets.

- **Contrast:** 4.5:1 for normal text; 3:1 for large text (24px+, or 18.66px+ bold) and for UI components. Logos and pure decoration are exempt. Never put readable text in a color that fails; use the design tokens.
- **Images:** every meaningful image has real alt text. Decorative images get `alt=""`; decorative text gets `aria-hidden="true"`.
- **Names:** every input has a label. Every icon-only button or link has an accessible name.
- **No text baked into images.** Recreate the styling with CSS.
- **Text over images or gradients** needs a scrim or overlay so it stays readable.
- **New page template or major flow:**
  1. Add it to `ROUTES` in `tests/a11y/axe.spec.ts` (if the sitemap doesn't cover it) and to `KEY_PAGES` in `tests/a11y/aria-snapshot.spec.ts`.
  2. Extend `tests/a11y/keyboard.spec.ts` for the new flow.
  3. AI review: read the aria snapshot plus a screenshot and check for vague link text ("click here", "read more"), useless alt text ("image", file names), and hard-to-read text over images. Advisory, not a gate.
