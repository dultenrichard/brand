# Editorial redesign review

## Source and approval

Source: https://github.com/dultenrichard/dultenrichard, public, `main`.
Baseline: `a0f84be5909dcc2a9e337a0ed69d0eca6f280468` (Release verified timeline site and root-route migration).
Branch: `redesign/editorial-record`. Draft PR: https://github.com/dultenrichard/dultenrichard/pull/9. The initial implementation passed GitHub Validate website; subsequent revision results are checked separately. All existing branches and history retained; production main untouched.
Owner-private review: https://dulten-editorial-review.dulten.chatgpt.site

## Design research

The requested reference homepages were reachable through web retrieval on 10 October 2026 UTC: Chris Hadfield, Nick Velten, Sophia Amoruso, Derek Sivers, Brittany Chiang, Jey Austen, Colin Moy, and the Webflow collection. Content and hierarchy were reviewed; reference animations were not measured in a browser.

Hadfield's identity and concise navigation inform the clear personal masthead. Velten's large name treatment informs the emphasis on personal identity. Amoruso's narrative progression informs varied sections rather than uniform cards. Sivers' writing and direct organization inform accessible, substantial records. None of the layouts or claims were copied.

## Design and behaviour

The homepage is rebuilt as a new publication-style sequence:

- A dark, full-height identity stage, oversized uppercase name, copper serif surname, and an authentic monochrome portrait in a ruled frame.
- A large perspective statement and offset biographical introduction on warm paper.
- Numbered full-width experience entries with large titles and compact evidence summaries.
- A compact 2019–2026 year selector with keyboard tab controls; all milestones remain readable without JavaScript and link to the preserved complete year records.
- A dark recognition ledger, three interest columns, and a large treatment of the original liquid-leadership quote.
- A copper contact chapter with a large conversation heading.

The previous homepage hero, signal strip, feature list, long vertical homepage timeline, recognition block, and interest layout have been replaced. The full archival timeline remains at `/timeline/` and all year URLs are preserved.

Secondary pages share a dark masthead, copper accents, uppercase chapter headings, serif record titles, and the new footer treatment. System fonts avoid external font downloads. CSS and JavaScript links carry revision parameters so cached assets do not conceal the new visual treatment.

Animation remains restrained, with reduced-motion and failure fallbacks. Analytics require explicit browser opt-in; the review preview disables analytics entirely.

## Validation

44 HTML pages; 685 internal references, including 76 asset references; no internal errors. Existing structure validator and JavaScript syntax check pass. One broken generated gallery story link repaired: challenge coins now open `/experience/#challenge-coins` rather than a nonexistent award anchor.

14 unique external links checked. 13 returned HTTP 200; LinkedIn profile returned 999 (bot restriction). Three Instagram destinations remain unverified despite HTTP 200 because a login shell does not establish profile/post visibility. Existing profile addresses are preserved pending authenticated confirmation.

51 production HTML/resource URLs were tested, all HTTP 404. Required `/`, `/experience/`, `/skills/`, `/awards/`, `/sources/`, `/contact/`, `/timeline/2026/`, `/privacy/`, `/robots.txt`, and `/sitemap.xml` are not active. `docs/link-report.json` contains URL-by-URL results. Native Sites deployment returned succeeded for the private review. Source checks are not represented as successful public GitHub route checks.

No supported control-browser skill is available in this managed environment. Browser visual QA, keyboard interaction testing, browser back/forward behavior, and Lighthouse/Core Web Vitals measurements remain unperformed. Responsive rules cover phone/tablet/desktop layouts, but that is not a measured browser result. The existing portrait is 360×495; larger authentic photography would improve large-screen image sharpness.

Evidence records are preserved. Existing award gallery entries with null image/document fields remain without attached certificate files; no documents or qualifications were fabricated.

## Activation

Follow `docs/DEPLOYMENT.md`. The root host repository must be created and Pages enabled before production URLs can work. `docs/root-pages.yml` is a ready-to-install workflow which continuously reads approved source main without a cross-repository secret. The connector cannot perform repository creation or Pages configuration. Approval is required before merging this redesign. No redesign deployment into main occurred.

## Changed file groups

Homepage; shared editorial stylesheet and JavaScript; primary experience/skills/awards/sources/contact/privacy pages; 2019–2026 year pages and new timeline index; useful existing 404 page styling; sitemap; award gallery data; link checker; CI artifact/check configuration; root deployment template and review/diagnosis/reports. Existing styles.css remains as the base, with the new design in editorial.css to preserve established component behavior.
