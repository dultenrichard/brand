# Development

The current redesign branch is `redesign/editorial-record`; main remains unchanged pending review. Existing development branches remain available. Do not deploy root-relative routes under the old `/brand/` project host.

## Content workflow

1. Reconcile factual changes with the owner's latest corrections; record provenance in docs/CONTENT-AUDIT.md.
2. Edit data/profile.json. Award attachment paths live in data/awards.json. Public source descriptions live in data/references.json.
3. Run `python scripts/build_site.py` to regenerate pages and search data.
4. Run `python scripts/build_experience_pdf.py` with ReportLab and pypdf installed when profile content changes. Render all PDF pages and inspect layout.
5. Run `python scripts/validate_site.py`, `python scripts/check_links.py --report docs/link-report.json`, and `node --check site.js`.
6. Commit source and generated output together. Review in the private Site and draft PR before changing production.

The website is buildless at runtime. The HTML renderer uses Python's standard library. JavaScript progressively enhances content; no external framework is required. Never add private credentials or unpublished evidence to the public data files.

See docs/DESIGN-SYSTEM.md for motion, privacy, asset provenance, and verification limitations; docs/DEPLOYMENT.md for root-host migration.
