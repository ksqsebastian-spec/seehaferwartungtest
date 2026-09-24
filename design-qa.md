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

## Hamburg trust correction

- User selected Hamburg outline. Replaced photograph backdrop with a dot map projected from the Hamburg boundary. Source and attribution recorded in README.
- Corrected desktop card width (44.3vw), landscape composition, 24px padding/gap, 16px image corners, 766:505 aspect ratio and scroll-driven entrance/scaling.
- Corrected mobile to the source's 296px cards at 390px viewport and a horizontal snap carousel. Swipe verified (scrollLeft changed to 344 in the initial revision); document remained 390px wide.
- Centered mobile navigation and removed the separate mobile contact pill to match the source. Corrected serif wordmark and 50px mobile hero heading.
- Verified local desktop/mobile and Cloudflare rendering. No console errors during checked flows. Build and JS syntax passed.
- Evidence: design/trust-desktop.png, design/trust-mobile.png, design/trust-live.png, design/reference/trust-mobile.png. Screenshots reflect different points in the scroll sequence; no pixel-perfect comparison is claimed.
- Cloudflare deployment: a43dc28684c045398f409d2d9e92d8fc.
- Remaining fidelity limit: original clinical assets and customer-density markers are not Seehafer evidence; Seehafer imagery and a Hamburg city marker are used. Animation curves are recreated, not verified frame for frame. Full-site perfect-copy acceptance remains unverified.
