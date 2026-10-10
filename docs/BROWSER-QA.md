# Browser review of The Current

The motion layer, workshop interactions and homepage chapter navigation are tested in an actual Chromium browser in GitHub Actions, at 1440×900 and 390×844. The scenario runs with prefers-reduced-motion to ensure content remains available without animation.

The Browser visual QA workflow starts the preview server locally, installs a browser runner, visits Home and Projects, interacts with the workshop selector, checks runtime errors and basic responsive overflow, then saves full-page screenshots as a temporary Actions artifact.

Automated screenshots and smoke tests catch obvious rendering and runtime failures, not design judgment or all accessibility/performance issues. Inspect screenshots and the StackBlitz preview manually before approving the PR. Screenshots are retained for 14 days.

Design references: Steven Mengin (cinematic atmosphere, typography) and Milan Compain (guided, interactive journey). The website's unique concept is a current map rooted in water, navigation, and adaptability rather than copied graphics.
