# Development workflow

This repository uses two long-lived branches:

- **main** — production. The public GitHub Pages website is treated as live from this branch.
- **dev** — development/staging source. New website work should be committed here first.

## Normal workflow

1. Make changes on `dev`.
2. Push and let the **Validate website** GitHub Action run.
3. Test the changed pages.
4. Open a pull request from `dev` into `main`.
5. Review the diff and validation result.
6. Merge only when the change is ready for the public website.

Do not use `main` for experiments.

## Rollback

If a production change causes a problem, revert the merge/commit on `main` or restore the previous known-good commit. Development can continue independently on `dev`.
