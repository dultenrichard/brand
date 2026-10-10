# Design system — River / Record

The first screen makes space for a person: name, location, dark water, and a quiet invitation to scroll. Detail arrives in chapters. Existing authentic portrait photography appears after the opening rather than competing with the name.

Ink, slate blue, ivory, and restrained gold connect the site to water and the owner's leadership quote. Self-hosted Newsreader supplies expressive typography. Layouts change with the subject: seven stems represent seven cadet ranks; a large 205 marks community time; the employment record uses clear rows; recognition uses a filterable ledger; projects use a distinct illustrated section; supporting documents use an explicit download cover.

Motion serves orientation: opening typography enters, chapters reveal, water moves slightly with scrolling, the header retreats and returns, and year navigation follows reading position. A persistent pause control and device reduced-motion preference stop decorative movement. All substantive content remains available without JavaScript.

## Artwork

Original generated atmospheric artwork, not documentary photography of a named place or the owner's boat. Image generation mode: new image. Website asset: `assets/images/water-study.webp` (approximately 154 KB); mechanical WebP encoding only. Authentic portrait retained separately.

Prompt: Create a cinematic fine-art photographic study of a dark river surface at blue hour, wide 16:9, close elevated viewpoint across gentle ripples, one oblique sweep of pale silver evening light from upper right toward lower middle. Nearly black navy, slate blue, restrained silver, tiny warm gold reflections. Quiet left half for ivory HTML type. No land, recognizable location, boats, humans, sky, letters, logos, frame, or mockup. Natural texture and film grain; no glossy CGI, neon, or oversaturation. Atmospheric artwork, not documentary evidence.

## Functional connections

Shared reviewed JSON generates 18 pages and an 80-entry search index. Search, recognition filters, evidence-linked skills, chronological navigation, downloadable PDF, document-request links, and an email-draft composer are implemented. Contact opens the visitor's email application; it does not pretend to send messages. Award files render only when actual attachment paths exist. Analytics are opt-in on the intended public hostname, respect GPC/DNT, and cannot load on the private review hostname.

## Verification limits

Source structure, internal links, JavaScript syntax, CSS parsing, and DOM interaction checks have passed. PDF pages were rendered and inspected. A supported browser-control skill is unavailable, so rendered website appearance, native focus behavior, and measured mobile performance have not been browser-verified. Responsive CSS is implemented, not represented as a measured browser result.

## Workshop playbook / Navigation transition

The youth leadership business project now uses an original vector tactical board (`assets/images/workshop-playbook.svg`). Four numbered movement points and a shared field of play correspond to Listen → Decide → Act → Reflect. The homepage teaser and the Projects page share the same identity; phase controls on the project page describe a *proposed* activity, not a completed pilot. No stock team photograph or implied endorsement of a youth sports organization is used.

For normal navigation the site displays immediately. A non-blocking progressive enhancement shows the editorial branded transition only when a user-initiated internal document navigation is still pending after 450 ms. It avoids download, off-site, modified-click and hash-only links. The pagehide/pageshow handlers, Escape key, Stay button and 8-second safety limit ensure the old page does not remain covered if navigation is cancelled or blocked. Reduced-motion preferences disable the moving progress line.

## October 10 — The Current / visual evolution

Design references examined: Steven Mengin's atmospheric landing page and project storytelling; Milan Compain's 2026 Awwwards-nominated guided cosmic portfolio. The rebuilt direction is distinct: a navigable **water-current field** rooted in the owner's leadership quote and sailing interests, not a borrowed star or an imitation of either artist's client work.

Implemented by progressive enhancement to the existing content-generated site: interactive Canvas 2D current-lines and navigation-chart particles, measured luminosity that follows the pointer, restrained instrument / compass illustration, chapter rail (Opening, About, Practice, Projects, Archive), an interlude connecting verified work and community contributions, large-form typography, editorial project environments, adjusted portrait composition, darker chapter transitions, and typographic interior-page masts. The canvas is capped to 30 fps and 1.75 device-pixel ratio, stops out of view, stops on document visibility or Pause motion, and respects reduced-motion preferences. All primary headings and links are still ordinary crawled HTML. The 2026 youth workshop is still labeled in development; no invented partners, awards, clients or outcomes.

Comparative visual review is still required in an actual browser before merging. Avoid overstating design-award prospects or rankings.
