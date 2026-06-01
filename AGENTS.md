## Workflow

- Always create a new branch per issue before starting work. Branch naming: `<type-of-work>/<short-description>`, where `<type-of-work>` can be feature, fix, refactor etc.
- Subagents may use git worktrees for isolation, but all changes must be merged back to the issue branch — never directly to `main`.
- Commits: start messages with a prefix (`fix:`, `feat:`, `chore:`, etc.) followed by a short summary. Keep the commit subject concise (imperative mood) and the body brief and specific—explain *what* and *why* when necessary. Example: `feat: add room search endpoint`.
- Pull Requests: PR titles should include prefixes; similar to commits. PR descriptions should also be concise and specific—summarize intent and important implementation notes.
- Always use *Squash* method when merging.
- A PR to `main` may only be created after the issue is fully implemented **and** the user has explicitly approved it.

## Code style

- Do not commit work-in-progress documentation or spec files — only commit code.
- Only comment code when the logic is genuinely tricky. Code should be self-explanatory; avoid comments that restate what the code does.
