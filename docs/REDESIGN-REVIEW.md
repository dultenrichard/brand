# Ground-up website rebuild

Private review: https://dulten-editorial-review.dulten.chatgpt.site/?revision=5

Draft PR: https://github.com/dultenrichard/dultenrichard/pull/9

This revision replaces the earlier layouts, shared stylesheet, JavaScript, and page renderer. A quiet water opening develops into varied personal, work, project, and archival chapters. See DESIGN-SYSTEM.md for visual decisions and DESIGN-RESEARCH.md for the reference research.

CONTENT-AUDIT.md records the reconciliation with the newer LinkedIn conversation. The reviewed profile JSON now supplies website records, searchable content, and a designed three-page experience PDF. PDF links use email and LinkedIn, avoiding dependence on the private review host. The supporting-records section reflects Dulten's confirmation that he holds proof of each award; private evidence has not been published.

Validation: 45 HTML pages, 861 internal references, 131 asset references, no internal errors. Source validator and JavaScript syntax pass. Earlier DOM checks cover search, filters, contact prefill, reduced motion, and analytics consent. The PDF's three pages were rendered and visually inspected. Browser visual QA remains unavailable; no Lighthouse or browser performance claim is made.

The main branch is unchanged. Root GitHub Pages hosting still requires the separate migration described in DEPLOYMENT.md; the working review is the owner-private Sites URL above. This revision is not an assertion that the proposed GitHub root host is active.
