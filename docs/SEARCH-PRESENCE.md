# Search presence and identity: October 10, 2026

## Primary obstacle

The canonical root host `https://dultenrichard.github.io/` was inaccessible at this review (the source repository is `dultenrichard/dultenrichard` and a separate Pages host is not established). A strong design or perfect metadata cannot compensate for pages that search engines cannot reach. See `docs/DEPLOYMENT.md` for the approved main-to-Pages publishing architecture. Do not submit the private review site or announce root URLs before the public host is live.

## Identity and on-page clarity

The site's canonical public identity is **Dulten Richard Fromentin**, with **Dulten Richard** and **Dulten Fromentin** as recognisable name variants. The home ProfilePage/Person record includes these variants and a stable person ID; visible copy remains first-person and avoids keyword stuffing. LinkedIn, GitHub and Instagram `sameAs` links are only attached to known owned profiles.

Keep the timeline, awards, employment, and certifications grounded in the single reviewed `data/profile.json`. Dates, awards and supporting records must match public LinkedIn where that profile has newer corrections. The Youth Leadership Workshops offering is **in development**, not a delivered program or a sponsored partnership.

## Crawl and search readiness

- Canonical URLs use root paths; previous `/brand/` routes redirect to them.
- HTML is server-readable static markup; the visual interaction layer progressively enhances it.
- `robots.txt` allows public crawling and points to the sitemap.
- `sitemap.xml` lists all 17 root content routes, including Projects and Timeline. Date signals indicate the current October 10 review.
- GitHub Pages root publishing must copy the ownership key file, not merely `llms.txt`.
- IndexNow announcements belong **after** the approved public deployment, not at source-push time. The Pages-host template now runs the canonical sitemap submission after successful deployment and link checks.
- The private preview remains noindex. Public tracking is consent-based, and unrelated documents/awards proof are not published without explicit authorisation.

## Release gates

1. Review and merge draft PR #9 to approved `main`.
2. Establish the separate `dultenrichard.github.io` Pages host and its `pages.yml` workflow. No new production site is claimed before this.
3. Confirm HTTP 200 for root, Projects, Experience, Awards, Timeline, robots, sitemap, and ownership key; verify redirects and canonical URLs in actual HTML.
4. Verify the property in **Google Search Console** and **Bing Webmaster Tools** under the user's own accounts. Submit `sitemap.xml` and inspect a sample of canonical URLs. Use IndexNow to notify participating engines of published changes.
5. Monitor actual impressions, queries and indexed pages; test full name and name variants before making any search ranking claims.

## What search-engine documentation actually supports

Google's guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

Bing guidelines: https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a

IndexNow: https://www.bing.com/indexnow/getstarted

Both Google and Bing stress crawlable, high-quality, properly structured, trustworthy content. Google says special AI files or schema hacks are not required for AI search; `llms.txt` is therefore an optional convenience, not a ranking strategy. Ranking for just "Dulten" or "Fromentin" cannot be guaranteed, especially because the surname is shared; begin with distinctive full-name presence and consistent third-party profile links.
