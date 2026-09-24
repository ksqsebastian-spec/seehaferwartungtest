# Lassie fidelity revision — 24 September 2026

Reference: https://www.lassie.ai/ . Concept.png remains the Seehafer content brief. No separate Figma file was supplied.

## Implemented and checked

- Replaced the original editorial layout with the reference sequence: fullscreen video, centered introduction, pinned three-card stack, floating information collage, scrolling sector cards, three process diagrams, FAQ, photo CTA and oversized footer wordmark.
- Reference font faces and measured typography, warm #f9f8f5 canvas, compact segmented navigation, 277 × 56 inquiry form positioned 16px above the hero bottom.
- Card stage approximately 57vw wide at desktop, with 64px corner radius; mobile uses 16px gutters and 24px corners.
- Desktop comparison at 1440 × 900 and mobile at 390 × 844. Reference captures are in design/reference. Desktop hero compared side by side; corrected navigation padding, CTA colour and input translucency after comparison.
- Mobile menu opens and inquiry action closes it and opens the modal. FAQ expands. Sample protocol opens and closes. No horizontal document overflow at the checked widths.
- Browser console: no JavaScript errors during verification. Syntax check and asset build pass.
- Live Cloudflare check: updated typography rendered, video readyState 4 and playing, document width matches viewport.

## Intentional content substitutions and limits

- Hamburg footage and actual Seehafer portfolio photos replace clinical imagery. Sector cards replace unsupported testimonials, and a Hamburg photo replaces the US map. Brand mark and German copy remain Seehafer.
- Scroll transitions are a recreation of the observed behaviours, not the original site's animation implementation. This is not a claim of frame-for-frame identity. Mobile headline is slightly smaller to retain two lines in German.
- ABC Marist / DM Sans font files were retrieved from the reference's public website assets. This implementation does not establish a separate font licence.
- The inquiry prepares an email in the visitor's mail application; there is no server-side lead submission. The prior browser safety restriction prevented testing the final mailto navigation, so it was not retried. Dialog opening and form visibility were verified.

Deployment: https://seehaferwartungtest.ksqsebastian.workers.dev/
Cloudflare deployment ID: 4342ed9b066445ea8e2d56d9799bb492
