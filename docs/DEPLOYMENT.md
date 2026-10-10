# Root GitHub Pages deployment

The connected account exposes the public source repository `dultenrichard/dultenrichard`, default branch `main`, with admin/push access. The source was cloned successfully. On 10 October 2026 UTC the intended root URL and all tested root routes returned HTTP 404. No `dultenrichard.github.io` repository appears in the account's accessible repository list. The README describes the root migration as staged, not deployed. A public unauthenticated Pages settings API request also returned 404; that response alone cannot establish whether Pages is enabled.

The confirmed architectural problem is that the required user-site repository is absent. Source code can be kept in its current repository; renaming it or rewriting history is unnecessary. Current source is already rooted at `/`, so deploying it as a project site is insufficient.

## Activation (requires GitHub repository creation and settings access)

1. Create a public repository named exactly `dultenrichard.github.io` under `dultenrichard`. This is a deployment host; keep this source repository and all branches.
2. In that repository, Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Install `docs/root-pages.yml` from this source repository as `.github/workflows/pages.yml` in the new host. Run it through Actions → Publish approved personal website → Run workflow. It reads only source `main`; no cross-repository write token is needed because the source is public.
4. The scheduled run publishes approved source hourly. It can be run manually for immediate approved releases. This is automated deployment, with no repeated manual file copying.
5. Verify the root and required routes with `python scripts/check_links.py --published https://dultenrichard.github.io/`. Do not treat workflow completion alone as a link audit.

The GitHub connector available in this session has no create-repository, Pages-settings read/write, or workflow-dispatch action. Activation remains blocked on steps 1–3. No production settings or branches were changed. The redesign requires approval and a merge before this host may deploy it.

The isolated owner-private review preview is not the GitHub production URL. It blocks indexing and disables analytics. GitHub production canonicals remain unchanged in source.
