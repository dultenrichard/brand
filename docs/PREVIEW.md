# Interactive preview (does not publish the site)

**For a visual test of the real source branch, open this repository commit in StackBlitz.** The preview contains the existing static markup, typography, styles, scripts, illustrations, route hierarchy and PDF. It is not a new implementation and does not modify GitHub `main`. Browser-powered StackBlitz imports are documented at https://developer.stackblitz.com/guides/user-guide/importing-projects.

The zero-dependency preview server exists solely for local and WebContainer visual testing. `package.json` starts it with `npm run dev`, and `.stackblitzrc` configures the WebContainer automatically. The server treats folders as `index.html` routes, sends standard content types and returns an X-Robots-Tag of `noindex, nofollow` on every response. It blocks source directories and directory traversal. Analytics in `site.js` loads only on the intended public hostname, not in StackBlitz.

Preview checks:

- Homepage desktop and phone: lettering, portrait, water and light imagery, horizontal overflow, contrast, font loading.
- Projects: sailing drawing, Youth Leadership Workshops tactical board, the four-phase Listen/Decide/Act/Reflect interaction.
- Navigation: About, Experience, Awards, Projects, Sources, Timeline; search, skills filters, old URL redirects and PDF download.
- Motion: reduced-motion OS preference, pause/resume control, scroll transitions and delayed navigation.
- Accessibility: keyboard focus, mobile tap targets, the search dialog, legible responsive type, long text.
- Data: visible awards, schools and training match `data/profile.json`; the pilot remains marked as uncompleted.

This preview is not a substitute for production browser QA or a root GitHub Pages deployment. The stable source of truth is draft PR #9. Any observation on StackBlitz should be fixed in the draft GitHub branch before production publication.
