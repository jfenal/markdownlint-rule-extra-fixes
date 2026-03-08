# Push to GitHub

The repo was re-initialized (no prior history). Add GitHub and push:

**Create the repo and push (first time):**

```bash
gh repo create jfenal/markdownlint-rule-extra-fixes --public --source=. --remote=origin --push
```

**If the repo already exists on GitHub:**

```bash
git remote add origin https://github.com/jfenal/markdownlint-rule-extra-fixes.git
git push -u origin main
```

You can delete this file after pushing.
