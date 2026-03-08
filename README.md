# markdownlint-rule-extra-fixes

Custom [markdownlint](https://github.com/DavidAnson/markdownlint) rules that provide **fixInfo** for rules the core does not auto-fix. Use with `markdownlint-cli2 --fix` to apply fixes.

**Repository:** [https://github.com/jfenal/markdownlint-rule-extra-fixes](https://github.com/jfenal/markdownlint-rule-extra-fixes)

**AI attribution:** Some code and documentation in this repository were developed with AI-assisted tooling (e.g. Cursor). The maintainer reviews and takes responsibility for all contributions.

**Note:** npm publication is not planned; install from this Git repo or use a local path (see below).

## Install

Install [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) (if not already in your project) and the plugin using one of the options below.

**Locally (same repo)**  
Point `customRules` at this directory. In `.markdownlint-cli2.jsonc`:

```json
"customRules": ["./path/to/markdownlint-rule-extra-fixes"]
```

**From this Git repo:**

```bash
# npm
npm install markdownlint-cli2 markdownlint-rule-extra-fixes@git+https://github.com/jfenal/markdownlint-rule-extra-fixes.git#main

# yarn / pnpm
yarn add markdownlint-cli2 'markdownlint-rule-extra-fixes@git+https://github.com/jfenal/markdownlint-rule-extra-fixes.git#main'
pnpm add markdownlint-cli2 'markdownlint-rule-extra-fixes@git+https://github.com/jfenal/markdownlint-rule-extra-fixes.git#main'
```

**Clone and install from path:**

```bash
git clone https://github.com/jfenal/markdownlint-rule-extra-fixes.git
cd your-project
npm install markdownlint-cli2 ./markdownlint-rule-extra-fixes
```

Then use the package name `markdownlint-rule-extra-fixes` in `customRules` as usual.

## Usage

Add the package to `customRules` in your markdownlint config (e.g. `.markdownlint-cli2.jsonc`):

```json
{
  "config": { ... },
  "customRules": [ "markdownlint-rule-extra-fixes" ]
}
```

Then run:

```bash
npx markdownlint-cli2 --fix "**/*.md"
```

Fixes from these rules are applied together with markdownlint's built-in fixes. Disable the corresponding built-in rule when using a `-fix` rule to avoid duplicate violations.

## Rules

| Rule        | Description | Config |
|------------|-------------|--------|
| **MD013-fix** | Line length. Wraps paragraphs, list items, blockquotes. | `line_length` (default: 80) |
| **MD033-fix** | No inline HTML. Converts common tags to markdown, wraps rest in backticks. | `convert_elements`, `quote_remaining_as_code` |
| **MD036-fix** | Emphasis as heading. Converts a line that is only `**Bold**` / `*Italic*` into a heading. | `heading_level` (default: 2) |
| **MD040-fix** | Fenced code language. Inserts default or inferred language after opening fence. | `default_language` (default: "fixme"), `infer_language` |
| **MD041-fix** | First line heading. Prepends a top-level heading when missing. | `default_heading` (default: "Document") |
| **MD042-fix** | No empty links. Replaces empty `]( )` / `](#)` with a URL. | `url_placeholder` (default: "fixme_url") |
| **MD047-fix** | Trailing newline. Ensures file ends with a single newline. | — |

### Config example

```json
{
  "config": {
    "MD040": false,
    "MD040-fix": {
      "default_language": "fixme",
      "infer_language": true
    },
    "MD041": false,
    "MD041-fix": { "default_heading": "Document" },
    "MD042": false,
    "MD042-fix": { "url_placeholder": "fixme_url" },
    "MD036": false,
    "MD036-fix": { "heading_level": 2 },
    "MD033": false,
    "MD033-fix": { "quote_remaining_as_code": true },
    "MD013": false,
    "MD013-fix": { "line_length": 80 },
    "MD047": false,
    "MD047-fix": true
  },
  "customRules": [ "markdownlint-rule-extra-fixes" ]
}
```

## Development

From the repo root:

```bash
npm install
npm test
```

## Related

- [markdownlint](https://github.com/DavidAnson/markdownlint) – core linter
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) – CLI with `--fix` and `customRules`
