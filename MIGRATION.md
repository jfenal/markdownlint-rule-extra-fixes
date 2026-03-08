# Migrate from GitLab to GitHub

Follow these steps after committing the URL/documentation updates.

## 1. Create the repo on GitHub

```bash
gh repo create jfenal/markdownlint-rule-extra-fixes --public --source=. --remote=origin --push
```

If the repo already exists, skip to step 2.

## 2. If you already have a GitHub repo (no `--push`)

Point `origin` to GitHub and push:

```bash
git remote set-url origin https://github.com/jfenal/markdownlint-rule-extra-fixes.git
# or: git remote set-url origin git@github.com:jfenal/markdownlint-rule-extra-fixes.git
git push -u origin main
```

## 3. Optional: keep GitLab as a secondary remote

```bash
git remote rename origin gitlab
git remote add origin https://github.com/jfenal/markdownlint-rule-extra-fixes.git
git push -u origin main
```

## 4. After migration

- Update any CI/CD or links that still point to GitLab.
- You can delete `MIGRATION.md` once done.
