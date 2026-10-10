# Personal website research and design decisions

This revision responds to the opening feeling crowded and the writing feeling artificial. The visitor first meets Dulten, then reads a short note, then chooses a record. The full history remains available on dedicated pages.

## Research method and limits

Reviewed public page content across author, designer, technologist, and personal archive sites, with HTML and available stylesheet inspection for the successful fetches listed below. Broader discovery included Minimal Gallery’s personal category and four gallery-linked sites: Philip Readman, Gabriel Beaugonin, Michael Gatt, and Jason Bergh. Inspected Minimal Gallery’s desktop capture of Philip Readman’s site as a visual reference. A fetched page or gallery capture is not a live interaction or responsive test. No reference images, copy, or layouts are reused as site assets.

The search also included Dulten’s public name and existing evidence links. Similar names, inaccessible pages, and an unrelated closed storefront were excluded. Public search is incomplete; it cannot establish a comprehensive biography. User-provided context and the existing verified record take precedence over search snapshots with inconsistent dates.

| Site | Public source |
| --- | --- |
| Chris Hadfield | https://chrishadfield.ca/ |
| Nick Velten | https://www.nickvelten.nl/ |
| Derek Sivers | https://sive.rs/ |
| Brittany Chiang | https://brittanychiang.com/ |
| Jey Austen | https://www.jeyausten.com/ |
| Colin Moy | https://colin-moy.webflow.io/ |
| Craig Mod | https://craigmod.com/ |
| Maggie Appleton | https://maggieappleton.com/ |
| Steph Ango | https://stephango.com/ |
| Julie Zhuo | https://www.juliezhuo.com/ |
| Paul Graham | https://www.paulgraham.com/ |
| Oliver Burkeman | https://www.oliverburkeman.com/ |
| Robin Sloan | https://www.robinsloan.com/ |
| Patrick Collison | https://patrickcollison.com/ |
| Anil Dash | https://www.anildash.com/ |
| Rands in Repose | https://randsinrepose.com/ |
| Austin Kleon | https://austinkleon.com/ |
| Tobias Ahlin | https://tobiasahlin.com/ |
| Jake Archibald | https://jakearchibald.com/ |

## What shaped the design

| Reference | Useful principle | Application here |
| --- | --- | --- |
| Derek Sivers, https://sive.rs/ | A brief introduction with routes to deeper material | A short About note; details live downstream |
| Julie Zhuo, https://www.juliezhuo.com/ | Few clear choices on a personal index | Three primary navigation links and a native More disclosure |
| Patrick Collison, https://patrickcollison.com/ | Specific interests convey personality without a sales narrative | Political science, international affairs, cadets, work, sport, and sailing stated plainly |
| Robin Sloan, https://www.robinsloan.com/ | Biography and directories connect different creative interests | Keep different parts of Dulten’s life together without forcing a single slogan |
| Craig Mod, https://craigmod.com/ | Real bodies of work deserve their own destinations | Preserve the archive; introduce a short projects page |
| Maggie Appleton, https://maggieappleton.com/ | Content can grow without becoming a single linear pitch | Projects are marked by actual status; no invented finished work |
| Philip Readman, https://www.philipreadman.com/ | Sparse navigation and generous space can support a substantial archive | Quiet entrance, then clearly separated records; no copied project imagery |
| Brittany Chiang, https://brittanychiang.com/ | A consistent dark surface can carry clear hierarchy | Retain the dark direction Dulten liked, without copying a developer portfolio |
| Michael Gatt, https://michaelgatt.com/ | A highly directed entrance can introduce friction | Do not add a sound gate or entrance animation |
| Jason Bergh, https://www.jasonbergh.com/ | Film-oriented visual devices depend on a large body of media | Do not manufacture a media reel, cinematic ruler, or photo archive |

Steph Ango’s essay https://stephango.com/style also informed the choice to keep a few consistent constraints instead of adding more effects. The type system uses Newsreader, supplied unmodified and self-hosted with its SIL Open Font License: https://github.com/productiontype/Newsreader and https://github.com/google/fonts/tree/main/ofl/newsreader . The portrait is the existing authentic photograph, rendered in grayscale by CSS.

## Personal evidence and boundaries

- The existing cadet, work, school, service, advocacy, and sport records remain intact.
- The 2019 4-H story names Dulten and his Maple Syrup and Pizza clubs: https://www.countylive.ca/4-h-awards-showcase-local-youth-achievements/ .
- The existing official rowing result is supported by https://rccdn.cachefly.net/results/10134_216c448c-b94e-45cb-b720-9f36e2c6f6d0.pdf . Do not infer overall placing from heat sheets.
- Grade 12, political science and international affairs interests, Equinox, and the Leadership Lab concept derive from shared personal context and the existing record. Leadership Lab is described as in development, with no delivered workshop claim.
- Cadet experience is not described as Canadian Armed Forces employment. COSSA rugby remains silver, not a championship. Awards and qualifications stay attached to their actual records.
- No private family, health, housing, financial details, manufactured endorsements, generated likenesses, or stock lifestyle photos were introduced.

## Concrete changes

The first screen contains the name, location, authentic portrait, and one small scroll link. Removed the artificial issue number, role list, leadership slogan, six numbered chapters, homepage award ledger, year tabs, and oversized contact pitch. Replaced secondary-page slogan headings with simple page names and year labels. Removed the repeated “What it is / What it meant to me / Why it matters” paragraph prefixes where present. Native navigation disclosure works without JavaScript; Escape closes it when enhanced.

The homepage has three sections instead of an extended campaign. Awards, skills, sources, employment, community involvement, and every year record remain available. This is progressive access, not hidden essential information. GOV.UK’s details guidance (https://design-system.service.gov.uk/components/details/) and MDN’s native details reference (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) informed the small navigation disclosure.

## Validation

Run `python scripts/validate_site.py`, `python scripts/check_links.py --report docs/link-report.json`, and `node --check site.js`. The crawler checks all HTML routes, local assets, fragments, metadata, CSS asset references, sitemap, and redirects. Browser visual and interaction QA is unavailable in this managed environment; CSS breakpoint inspection and link validation do not substitute for it. Review the deployed private site on desktop and mobile before merging the draft PR.
