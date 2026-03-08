# Test fixtures for markdownlint-rule-extra-fixes

Sample markdown files that trigger each fix rule. Run from repo root:

```bash
npx markdownlint-cli2 --fix "test/fixtures/*.md"
```

Or with a config that enables all `-fix` rules (see main README). After `--fix`, inspect the files to verify fixes.

| File | Rules exercised |
|------|------------------|
| `md013-line-length.md` | MD013-fix (long lines: paragraph, list, blockquote) |
| `md033-inline-html.md` | MD033-fix (strong, em, br, a, span→backticks) |
| `md036-emphasis-as-heading.md` | MD036-fix (**Bold** / *Italic* only line → heading) |
| `md040-fenced-code-language.md` | MD040-fix (``` with no language; infers bash, json, javascript, perl/ruby via shebang, python, php, yaml, sql; Perl without shebang is not inferred → default) |
| `md041-first-line-heading.md` | MD041-fix (no top-level heading → prepend default) |
| `md042-empty-links.md` | MD042-fix ([text]() / [](#) → url_placeholder) |
| `md047-trailing-newline.md` | MD047-fix (file does not end with newline) |
| `all-rules.md` | Multiple rules in one file |
