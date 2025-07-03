# Automatic Versioning System

This repository uses an automated versioning system that follows semantic versioning with a `beta-vX.Y.Z` format.

## How It Works

The system automatically analyzes commit messages and bumps versions based on [Conventional Commits](https://www.conventionalcommits.org/):

- **`feat:`** - New features → **Minor version bump** (e.g., `beta-v0.1.1` → `beta-v0.2.0`)
- **`fix:`** - Bug fixes → **Patch version bump** (e.g., `beta-v0.1.1` → `beta-v0.1.2`)  
- **`BREAKING CHANGE:`** or **`!:`** - Breaking changes → **Major version bump** (e.g., `beta-v0.1.1` → `beta-v1.0.0`)

## What Gets Updated

When a version bump occurs, the system automatically:

1. ✅ Updates the `VERSION` file in the repository root
2. ✅ Updates the `@version` field in ALL `.user.js` files (including subfolders)
3. ✅ Creates a commit with the changes
4. ✅ Creates a git tag with the new version
5. ✅ Creates a GitHub release (marked as prerelease)

## Triggering Version Bumps

The automation runs on every push to the `main` branch. To trigger a version bump:

1. Make your changes
2. Commit using conventional commit format:
   ```bash
   git commit -m "feat: add new awesome feature"
   git commit -m "fix: resolve issue with user script"
   git commit -m "feat!: breaking change that requires major bump"
   ```
3. Push to main branch:
   ```bash
   git push origin main
   ```

## Manual Trigger

You can also manually trigger the workflow from the GitHub Actions tab using the "Run workflow" button.

## Skip Automation

To skip version bumping for a commit (e.g., documentation updates), include `[skip ci]` in your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

## Current Version Format

- **Format**: `beta-vX.Y.Z`
- **Current**: `beta-v0.1.1` (check the `VERSION` file)
- **Location**: Version is stored in `/VERSION` and synchronized to all `.user.js` files

## Examples

| Commit Message | Version Change | Example |
|---|---|---|
| `feat: add new site support` | Minor bump | `beta-v0.1.1` → `beta-v0.2.0` |
| `fix: resolve checkbox detection` | Patch bump | `beta-v0.1.1` → `beta-v0.1.2` |
| `feat!: change API completely` | Major bump | `beta-v0.1.1` → `beta-v1.0.0` |
| `docs: update README [skip ci]` | No change | `beta-v0.1.1` (unchanged) |

## Troubleshooting

- **No version bump?** Check that your commit message follows conventional commits format
- **Wrong bump type?** Ensure you're using the correct prefix (`feat:`, `fix:`, etc.)
- **Want to skip?** Add `[skip ci]` to your commit message
- **Need manual trigger?** Use the "Actions" tab → "Bump Version" → "Run workflow"