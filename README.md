# Seehafer Elemente · Wartung

Live: https://seehaferwartungtest.ksqsebastian.workers.dev

German maintenance landing page based on the supplied Concept.png and the live Lassie website, with Mobbin references. Built with semantic HTML, CSS and JavaScript. Self-hosted fonts, images and optimized Hamburg video; no analytics or third-party embeds.

## Run

`npm ci` then `npm run dev` — http://localhost:4318 (Worker and static assets). Use `npm run dev:static` for the visual-only preview.

`npm run build` verifies the asset inventory and creates the Cloudflare upload manifest. `npm run deploy` uses an authenticated Wrangler installation. This deployment was published through the connected Cloudflare API with Workers static assets.

## Interaction

- Floating responsive navigation and mobile menu.
- Full-screen muted Hamburg video, pause control, reduced-motion support.
- Rotating status text, parallax, sticky service panels and intersection reveals.
- Inquiry dialog sends directly through a Cloudflare Worker and Resend to a fixed server-configured recipient. Only a successful provider response shows the confirmation.
- Native accessible FAQ accordions, sample maintenance protocol, print/PDF action and privacy dialog.

## Source boundaries

The PNG is a strategy map rather than a pixel-level Figma layout (confirmed by the user). One-hour/four-day service guarantees, testimonials, certification badges and internal software integrations were not asserted without verification. Protocols and UI cards are marked as examples. Stock footage illustrates Hamburg architecture; it does not represent a Seehafer project or endorsement.

## Sources and licenses

- Live visual reference: https://www.lassie.ai/ — full page reviewed including hero, sticky feature panels, collage, testimonials, process, FAQ, closing CTA, footer and expanded menu.
- Mobbin: https://mobbin.com/sites/sections/12951a6d-5b8b-441e-98fe-b0cb2a902198 and https://mobbin.com/sites/sections/dcaae0e2-5def-449a-b47b-5eb5bd001b17
- Hamburg video: Frank Rietsch, https://www.pexels.com/video/modern-buildings-reflecting-on-hamburg-canal-37101474/ — https://www.pexels.com/license/ (website use allowed). Original 4K video optimized to 18 seconds, 1600px, 24fps, silent H.264, 4.1 MB.
- Company facts/contact: https://seehafer-elemente.de/kontakt and https://seehafer-elemente.de/impressum (checked 2026-09-24).
- Existing company photos reused from the user's Mobbintime project; original source https://seehafer-elemente.de/referenzen.
- Manrope and Instrument Serif fonts reused from the user's earlier self-hosted assets.

## Design artifacts

`design/hero-concept.png`, `design/services-concept.png`, `design/lower-concept.png` generated using built-in image generation. Concepts are design references only, never used as website screenshots/assets. The user's later request for real Hamburg video superseded the initial doorway image. Lassie's live layout takes precedence where generated concepts diverge.

## Deployment

Cloudflare Worker: seehaferwartungtest
Deployment: badfc45174624e90a134b3411722b70c
Date: 2026-09-24

See design/verification.md for checks and limitations.

## September 24 fidelity revision
The live Lassie reference now determines typography, section geometry, compact navigation and pinned scrolling stages. See `design-qa.md` for reference evidence, verification, intentional Seehafer content substitutions and remaining fidelity limits. The earlier generated concept images are superseded by this revision.

The Hamburg dot map is projected from the Hamburg boundary in isellsoap/deutschlandGeoJSON (2_bundeslaender/4_niedrig.geo.json), published under the Unlicense, with source data credited there to GIS-DATA. The city marker identifies Hamburg, not a customer location or customer count. https://github.com/isellsoap/deutschlandGeoJSON

## Reusable company template — September 28

The approved white-background baseline is preserved at Git tag **seehaferwartungbase** (`d98a04a`). Restore into a separate checkout with `git worktree add ../seehaferwartungbase seehaferwartungbase`; do not reset the current checkout to preview it.

The current edition keeps the approved narrative: outcome → proof → relief → speed. Reference projects live on the page, with keyboard-accessible tabs, previous/next controls, and native detail dialogs. Published project facts and original photos were refreshed from https://seehafer-elemente.de/referenzen on 2026-09-28; retrofit projects are labeled separately from the maintenance contract.

- `public/projects.js`: project names, image paths, descriptions, verified figures, and colors.
- `public/experience.css`: reference component, motion tokens, responsive rules, reduced-motion and print styles.
- `public/experience.js`: project selection, detail dialog, pointer response, scroll progress and in-view motion.
- `public/style.css`: base typography, layout and brand tokens (`--ink`, `--blue`, `--lime`, `--sky`, `--lavender`).

For another company, replace project data and contact information, then update brand tokens. Keep the narrative structure and verify every published figure against that company's own sources. The Hamburg video and map belong to this company-specific edition.

Motion research: Mobbin's public Micro-interactions collection (Luma success feedback and Doji progressive selection) was inspected through the browser after connector search failed. Public previews were accessible; full flow playback was not available without account access. Inspired patterns are implemented independently, without copying screenshot assets. https://mobbin.com/screens/c9d14f68-316b-408e-b90b-67f54c7918cb

The inquiry now sends directly through Resend. No CRM automation is implied.


## Direct inquiry delivery

`POST /api/inquiry` validates the request, applies a five-per-minute per-IP Cloudflare rate limit, and sends a plain-text email with the visitor as Reply-To. Sender: `Seehafer Wartung <onboarding@resend.dev>`. The recipient is a fixed server secret; the browser cannot select recipients. The Resend test sender only delivers to the account owner, using the exact registered address. For another company/inbox, configure a verified sender domain first.

Configure `RESEND_API_KEY` (sending-only) and `INQUIRY_TO` with `wrangler secret put`. Never put either value in public files or Git. Local Worker development reads them from an ignored `.dev.vars` file. `wrangler.jsonc` contains the API route, ASSETS binding and rate-limit binding.

The frontend retains an idempotency key across retries of unchanged content and preserves form fields after errors. It clears the form only after a confirmed provider response. No automatic confirmation email is sent to the visitor. Request contents are not written to application logs or a site database; Resend and the recipient mailbox process/store the email.

`npm test` exercises validation, fixed recipients, origin checks, request limits, rate limits, provider failures and idempotent retries. Live end-to-end test on 2026-09-28: browser submission → success state → provider status **delivered**. The test was visibly labeled as a test, not a service order.

### Elements reference update (2026-09-29)
- Inspected the user's six-item Mobbin Elements collection: https://mobbin.com/collections/23a5924b-4d8b-4eb0-814b-d6e89d9c544c/sites/sections. TinyWins supplies the staggered project collage direction; Ada and Humble inform the selectable process story. Illustrations are original SVG/CSS, not extracted Mobbin artwork.
- Manufacturer assets 0–4 (GEZE, dormakaba, Würth, Hörmann, Repair Care) are the originals publicly embedded on https://seehafer-elemente.de/, checked 2026-09-29. They indicate published system scope, not customer endorsements or independent certification.
- Four customer quotes and named attributions come from that same company homepage. No aggregate rating, additional customer identities, or certificate badges were invented. Further projects and certificates need source materials.
- Process steps support keyboard navigation, explicit pause, reduced motion, and offscreen pause. Mobile view pans the illustration to the chosen step.
